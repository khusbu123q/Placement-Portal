import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import BoardsPage from './pages/BoardsPage.jsx'
import BoardPage from './pages/BoardPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import './styles.css'

function AppShell() {
  return (
    <BrowserRouter>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 20px',borderBottom:'1px solid #e5e7eb'}}>
        <Link to="/" style={{fontWeight:600, fontSize:20, textDecoration:'none'}}>Kanban</Link>
        <nav style={{display:'flex', gap:12}}>
          <Link to="/" >Boards</Link>
          <Link to="/auth" >Auth</Link>
          <a href="/api/health" target="_blank" rel="noreferrer">API</a>
        </nav>
      </header>
      <main style={{maxWidth:1100, margin:'20px auto', padding:'0 16px'}}>
        <Routes>
          <Route path="/" element={<BoardsPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/b/:boardId" element={<BoardPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<AppShell />)
