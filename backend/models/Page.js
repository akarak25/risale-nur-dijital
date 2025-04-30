const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
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
    required: true
  },
  chapter: {
    type: String,
    required: false
  },
  subChapter: {
    type: String,
    required: false
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

// Kitap ID ve sayfa numarası için bileşik indeks
pageSchema.index({ bookId: 1, pageNumber: 1 }, { unique: true });

// Full-text arama için indeks
pageSchema.index({ content: 'text' });

const Page = mongoose.model('Page', pageSchema);

module.exports = Page;