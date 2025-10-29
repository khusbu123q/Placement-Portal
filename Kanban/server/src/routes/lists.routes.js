import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import Board from '../models/Board.js'
import List from '../models/List.js'

const r = Router()
r.use(requireAuth)

r.post('/boards/:boardId/lists', async (req,res)=>{
  const board = await Board.findById(req.params.boardId)
  if (!board) return res.status(404).json({ error: 'Board not found' })
  const title = (req.body?.title || 'New List').trim()
  const position = (board.lists?.length || 0) * 1000
  const list = await List.create({ board: board._id, title, position, cards: [] })
  board.lists.push(list._id)
  await board.save()
  req.app.get('io').of('/boards').to(`board:${board._id}`).emit('list:created', { list })
  res.status(201).json({ list })
})

export default r
