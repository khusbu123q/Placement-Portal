export default function errorHandler(err, req, res, next) {
  console.error(err)
  if (err?.name === 'ZodError') return res.status(400).json({ error: 'Validation', issues: err.issues })
  return res.status(err?.status || 500).json({ error: err?.message || 'Server error' })
}
