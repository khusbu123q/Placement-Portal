import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import Board from '../models/Board.js'

const r = Router()
r.use(requireAuth)

r.get('/', async (req,res)=>{
  const boards = await Board.find({ 'members.user': req.user._id }).select('title members createdAt')
  res.json({ boards })
})

r.post('/', async (req,res)=>{
  const title = (req.body?.title || 'Untitled').trim()
  const board = await Board.create({ title, owner: req.user._id, members: [{ user: req.user._id, role: 'owner' }], lists: [] })
  res.status(201).json({ board })
})

r.get('/:boardId', async (req,res)=>{
  const board = await Board.findById(req.params.boardId).populate({ path: 'lists', populate: { path: 'cards' } })
  res.json({ board })
})

export default r
