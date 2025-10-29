import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import User from '../models/User.js'

const r = Router()
const Register = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6) })
const Login = z.object({ email: z.string().email(), password: z.string().min(6) })

const cookieOpts = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }

r.post('/register', async (req,res)=>{
  const data = Register.parse(req.body)
  const exists = await User.findOne({ email: data.email })
  if (exists) return res.status(409).json({ error: 'Email exists' })
  const passwordHash = await bcrypt.hash(data.password, 10)
  const user = await User.create({ ...data, passwordHash })
  const token = jwt.sign({ _id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.cookie(process.env.COOKIE_NAME, token, cookieOpts)
  res.json({ user: { _id: user._id, name: user.name, email: user.email } })
})

r.post('/login', async (req,res)=>{
  const data = Login.parse(req.body)
  const user = await User.findOne({ email: data.email })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const ok = await bcrypt.compare(data.password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
  const token = jwt.sign({ _id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.cookie(process.env.COOKIE_NAME, token, cookieOpts)
  res.json({ user: { _id: user._id, name: user.name, email: user.email } })
})

r.post('/logout', (req,res)=>{
  res.clearCookie(process.env.COOKIE_NAME)
  res.json({ ok: true })
})

export default r
