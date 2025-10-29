import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import List from '../models/List.js'
import Card from '../models/Card.js'

const r = Router()
r.use(requireAuth)

// Create card
r.post('/lists/:listId/cards', async (req,res)=>{
  const list = await List.findById(req.params.listId)
  if (!list) return res.status(404).json({ error: 'List not found' })
  const title = (req.body?.title || 'New Card').trim()
  const position = (list.cards?.length || 0) * 1000
  const card = await Card.create({ board: list.board, list: list._id, title, position })
  list.cards.push(card._id); await list.save()
  req.app.get('io').of('/boards').to(`board:${list.board}`).emit('card:created', { card })
  res.status(201).json({ card })
})

// Card details
r.get('/cards/:cardId', async (req,res)=>{
  const card = await Card.findById(req.params.cardId)
  if (!card) return res.status(404).json({ error: 'Card not found' })
  res.json({ card })
})

// Edit card (title/description)
r.patch('/cards/:cardId', async (req,res)=>{
  const card = await Card.findById(req.params.cardId)
  if (!card) return res.status(404).json({ error: 'Card not found' })
  if (req.body.title !== undefined) card.title = String(req.body.title)
  if (req.body.description !== undefined) card.description = String(req.body.description)
  await card.save()
  req.app.get('io').of('/boards').to(`board:${card.board}`).emit('card:updated', { card })
  res.json({ card })
})

// Move card with persisted position (toListId, toIndex)
r.post('/cards/:cardId/move', async (req,res)=>{
  const { toListId, toIndex } = req.body || {}
  const card = await Card.findById(req.params.cardId)
  if (!card) return res.status(404).json({ error: 'Card not found' })

  const fromList = await List.findById(card.list)
  const toList = await List.findById(toListId)
  if (!toList) return res.status(404).json({ error: 'Destination list not found' })

  // Remove from old list.cards
  fromList.cards = fromList.cards.filter(id => String(id) !== String(card._id))
  await fromList.save()

  // Determine new position based on neighbors in toList
  await toList.populate('cards')
  const sorted = await Card.find({ list: toList._id }).sort({ position: 1 })
  const prev = (toIndex-1 >= 0) ? sorted[toIndex-1] : null
  const next = (toIndex < sorted.length) ? sorted[toIndex] : null

  let newPos = 0
  if (!prev && !next) newPos = 1000
  else if (!prev && next) newPos = next.position - 1
  else if (prev && !next) newPos = prev.position + 1
  else newPos = (prev.position + next.position) / 2

  // Assign and save
  card.list = toList._id
  card.position = newPos
  await card.save()

  // Update toList.cards to reflect order (insert at toIndex)
  const ids = sorted.map(c => c._id.toString())
  ids.splice(toIndex, 0, card._id.toString())
  toList.cards = ids
  await toList.save()

  req.app.get('io').of('/boards').to(`board:${card.board}`).emit('card:moved', { cardId: card._id, toListId, toIndex, position: newPos })
  res.json({ card })
})

export default r
