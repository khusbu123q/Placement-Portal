import mongoose from 'mongoose'
const cardSchema = new mongoose.Schema({
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  list:  { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  title: { type: String, required: true },
  description: String,
  labels: [String],
  dueDate: Date,
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  position: { type: Number, default: 0 }
}, { timestamps: true })
export default mongoose.model('Card', cardSchema)
