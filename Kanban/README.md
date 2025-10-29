# Kanban MVP (Full) — MERN + Socket.io

A functional Trello-like Kanban with:
- User auth (register/login, HttpOnly cookie)
- Boards: create, list
- Lists: create
- Cards: create, view, edit title/description
- Drag & drop cards across lists with **persisted ordering**
- Real-time broadcast placeholders (events emitted) — ready for expansion

## Quick Start
```bash
cd kanban-mvp-full
npm install

cp server/.env.example server/.env
# edit MONGO_URI if needed

npm run dev
```
- Frontend: http://localhost:5173
- Backend:  http://localhost:8080/health

Login flow: use the simple auth form on `/auth`. Or hit "Use Demo" to auto-register+login a demo user.
