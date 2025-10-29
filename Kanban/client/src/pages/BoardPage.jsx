import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { io } from 'socket.io-client'
import http from '../api/http'

export default function BoardPage() {
  const { boardId } = useParams()
  const [board, setBoard] = useState(null)
  const [newList, setNewList] = useState('')

  const socket = useMemo(() => io('/boards', { path: '/socket.io', withCredentials: true }), [])

  useEffect(() => {
    socket.emit('join', { boardId })
    return () => socket.disconnect()
  }, [boardId, socket])

  useEffect(() => {
    async function load() {
      const { data } = await http.get(`/api/boards/${boardId}`)
      setBoard(data.board)
    }
    load()
  }, [boardId])

  useEffect(() => {
    socket.on('list:created', ({ list }) => {
      setBoard(prev => {
        if (!prev || String(prev._id) !== String(list.board)) return prev
        if ((prev.lists || []).some(l => String(l._id) === String(list._id))) return prev
        return { ...prev, lists: [...(prev.lists || []), list] }
      })
    })
    socket.on('card:created', (card) => {
      setCards(prev => {
        if (prev.some(c => c._id === card._id)) return prev; // already present
        return [...prev, card];
      });
    });
    socket.on('card:moved', ({ cardId, toListId, toIndex, position }) => {
      setBoard(prev => {
        if (!prev) return prev
        // Remove from all lists
        const lists = prev.lists.map(l => ({ ...l, cards: (l.cards || []).filter(c => String(c._id) !== String(cardId)) }))
        // Insert into target
        const idx = lists.findIndex(l => String(l._id) === String(toListId))
        if (idx >= 0) {
          lists[idx].cards.splice(toIndex, 0, { _id: cardId, title: '(moving...)', position })
        }
        return { ...prev, lists }
      })
    })
  }, [socket])

  async function addList(e) {
    e.preventDefault()
    const { data } = await http.post(`/api/boards/${boardId}/lists`, { title: newList || 'New List' })
    setNewList('')
    setBoard(prev => {
      if ((prev?.lists || []).some(l => String(l._id) === String(data.list._id))) return prev
      return { ...prev, lists: [...(prev.lists || []), data.list] }
    })
  }

  async function addCard(listId) {
    const raw = prompt('Card title?')
    if (raw === null) return // user cancelled
    const title = raw.trim() || 'New Card'
    const { data } = await http.post(`/api/lists/${listId}/cards`, { title })
    setBoard(prev => ({ ...prev, lists: prev.lists.map(l => String(l._id) === String(listId) ? { ...l, cards: [...(l.cards || []), data.card] } : l) }))
  }

  async function onDragEnd(result) {
    const { source, destination, draggableId, type } = result
    if (!destination || type !== 'CARD') return

    setBoard(prev => {
      const lists = prev.lists.map(l => ({ ...l, cards: [...(l.cards || [])] }))
      const fromListIdx = lists.findIndex(l => String(l._id) === source.droppableId)
      const toListIdx = lists.findIndex(l => String(l._id) === destination.droppableId)
      const [moved] = lists[fromListIdx].cards.splice(source.index, 1)
      lists[toListIdx].cards.splice(destination.index, 0, moved)
      return { ...prev, lists }
    })

    try {
      await http.post(`/api/cards/${draggableId}/move`, { toListId: destination.droppableId, toIndex: destination.index })
    } catch (e) {
      // reload board on failure
      const { data } = await http.get(`/api/boards/${boardId}`)
      setBoard(data.board)
    }
  }

  if (!board) return <div className="card">Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2>{board.title}</h2>
        <form onSubmit={addList} style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder="New list…" value={newList} onChange={e => setNewList(e.target.value)} />
          <button className="btn">Add List</button>
        </form>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="LIST" direction="horizontal">
          {(p) => (
            <div ref={p.innerRef} {...p.droppableProps} style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
              {(board.lists || []).map((list, idx) => (
                <div key={list._id} className="list">
                  <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600 }}>{list.title}</div>
                    <button className="btn" onClick={() => addCard(list._id)}>+ Card</button>
                  </div>
                  <Droppable droppableId={String(list._id)} type="CARD">
                    {(pp) => (
                      <div
                        ref={pp.innerRef}
                        {...pp.droppableProps}
                        style={{ display: 'grid', gap: 8, minHeight: 48, padding: 8 }}
                      >



                        {(list.cards || []).map((card, cidx) => (
                          <Draggable key={card._id} draggableId={String(card._id)} index={cidx}>
                            {(dp) => (
                              <div ref={dp.innerRef} {...dp.draggableProps} {...dp.dragHandleProps} className="card">
                                <CardItem card={card} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {pp.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
              {p.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

function CardItem({ card }) {
  const [title, setTitle] = useState(card.title)
  const [desc, setDesc] = useState(card.description || '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      await http.patch(`/api/cards/${card._id}`, { title, description: desc })
    } finally { setSaving(false) }
  }

  return (
    <div>
      <input className="input" value={title} onChange={e => setTitle(e.target.value)} onBlur={save} />
      <textarea className="input" style={{ marginTop: 6 }} rows={3} placeholder="Description…" value={desc} onChange={e => setDesc(e.target.value)} onBlur={save} />
      {saving && <div style={{ fontSize: 12, opacity: 0.6 }}>Saving…</div>}
    </div>
  )
}
