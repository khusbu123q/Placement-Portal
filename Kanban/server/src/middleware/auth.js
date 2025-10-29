import jwt from 'jsonwebtoken'
export function requireAuth(req, res, next) {
  const token = req.cookies?.[process.env.COOKIE_NAME]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch(e) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
