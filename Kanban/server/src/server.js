import 'dotenv/config'
import express from 'express'
import http from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import { Server as SocketIOServer } from 'socket.io'

import authRoutes from './routes/auth.routes.js'
import boardRoutes from './routes/boards.routes.js'
import listRoutes from './routes/lists.routes.js'
import cardRoutes from './routes/cards.routes.js'
import errorHandler from './middleware/error.js'

const app = express()
const server = http.createServer(app)

// Dev-friendly CORS + credentials
const allowed = ['http://localhost:5173','http://127.0.0.1:5173']
const corsOptions = {
  origin(origin, cb) { if (!origin || allowed.includes(origin)) cb(null, true); else cb(new Error('CORS: ' + origin)) },
  credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

const io = new SocketIOServer(server, { cors: corsOptions })
app.set('io', io)

app.get('/health', (_, res) => res.json({ ok: true }))
app.get('/api/health', (_, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/boards', boardRoutes)
app.use('/api', listRoutes)
app.use('/api', cardRoutes)

app.use(errorHandler)

io.of('/boards').on('connection', s => {
  s.on('join', ({ boardId }) => s.join(`board:${boardId}`))
})

server.listen(process.env.PORT || 8080, () => {
  console.log('✅ Server listening on :8080')
})

mongoose.connect(process.env.MONGO_URI)
  .then(()=> console.log('✅ Mongo connected'))
  .catch(e=> console.error('⚠️ Mongo error:', e.message))
