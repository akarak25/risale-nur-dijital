const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  name: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: '#3498db'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Kullanıcı, kitap ve sayfa için bileşik indeks
bookmarkSchema.index({ userId: 1, bookId: 1, pageNumber: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;