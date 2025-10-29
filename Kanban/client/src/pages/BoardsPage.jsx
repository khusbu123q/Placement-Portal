import React, { useEffect, useState } from 'react'
import http from '../api/http'
import { Link, useNavigate } from 'react-router-dom'

export default function BoardsPage(){
  const [boards, setBoards] = useState([])
  const [title, setTitle] = useState('')
  const [err, setErr] = useState('')
  const nav = useNavigate()

  async function ensureAuth(){
    try{
      await http.get('/api/boards')
    }catch{
      await http.post('/api/auth/register', { name:'Demo', email:'demo@example.com', password:'demopass' }).catch(()=>{})
      await http.post('/api/auth/login', { email:'demo@example.com', password:'demopass' })
    }
  }

  async function load(){
    setErr('')
    try{
      const { data } = await http.get('/api/boards')
      setBoards(data.boards || [])
    }catch(e){ setErr('Please login on the Auth page or click Use Demo.'); }
  }

  async function createBoard(e){
    e.preventDefault()
    await ensureAuth()
    const { data } = await http.post('/api/boards', { title: title || 'Untitled' })
    setBoards([data.board, ...boards])
    setTitle('')
    nav(`/b/${data.board._id}`)
  }

  useEffect(()=> { load() }, [])

  return (
    <div>
      <div className="card" style={{marginBottom:16}}>
        <form onSubmit={createBoard} style={{display:'flex', gap:10}}>
          <input className="input" placeholder="New board title…" value={title} onChange={e=>setTitle(e.target.value)} />
          <button className="btn">Create</button>
        </form>
        {err && <p style={{color:'#b91c1c', marginTop:8}}>{err}</p>}
      </div>
      <div style={{display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))'}}>
        {boards.map(b => (
          <Link key={b._id} to={`/b/${b._id}`} className="card" style={{textDecoration:'none', color:'inherit'}}>
            <div style={{fontWeight:600}}>{b.title}</div>
            <div style={{opacity:0.7, fontSize:12, marginTop:4}}>{(b.members||[]).length} members</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
