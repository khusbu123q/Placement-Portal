import mongoose from 'mongoose'
const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner','admin','member'], default: 'owner' }
}, { _id: false })

const boardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: { type: [memberSchema], default: [] },
  lists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }]
}, { timestamps: true })

export default mongoose.model('Board', boardSchema)
