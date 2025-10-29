import React, { useState } from 'react'
import http from '../api/http'

export default function AuthPage() {
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('demopass')
  const [name, setName] = useState('Demo')
  const [msg, setMsg] = useState('')

  async function register(e){
    e.preventDefault()
    try{
      await http.post('/api/auth/register', { name, email, password })
      setMsg('Registered! Now login.')
    } catch(e){ setMsg(e?.response?.data?.error || 'Register error') }
  }

  async function login(e){
    e.preventDefault()
    try{
      await http.post('/api/auth/login', { email, password })
      setMsg('Logged in! Go to Boards.')
    } catch(e){ setMsg(e?.response?.data?.error || 'Login error') }
  }

  async function useDemo(){
    try{
      await http.post('/api/auth/register', { name:'Demo', email:'demo@example.com', password:'demopass' }).catch(()=>{})
      await http.post('/api/auth/login', { email:'demo@example.com', password:'demopass' })
      setMsg('Demo user ready.')
    }catch{ setMsg('Demo error') }
  }

  return (
    <div className="card" style={{maxWidth:420, margin:'20px auto'}}>
      <h2>Auth</h2>
      <form onSubmit={login} style={{display:'grid', gap:10}}>
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn" type="submit">Login</button>
      </form>
      <hr style={{margin:'16px 0'}}/>
      <form onSubmit={register} style={{display:'grid', gap:10}}>
        <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn" type="submit">Register</button>
      </form>
      <div style={{display:'flex', gap:10, marginTop:10}}>
        <button className="btn" onClick={useDemo}>Use Demo</button>
      </div>
      {msg && <p>{msg}</p>}
    </div>
  )
}
