const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  pageNumber: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  color: {
    type: String,
    default: '#f1c40f'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Kullanıcı ve kitap için indeks
noteSchema.index({ userId: 1, bookId: 1, pageNumber: 1 });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;