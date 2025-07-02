const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    default: 'Bediüzzaman Said Nursi',
    trim: true
  },
  coverImage: {
    type: String,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['Sözler', 'Mektubat', 'Lem\'alar', 'Şualar', 'İşarât-ül İ\'caz', 'Mesnevî-i Nuriye', 'Barla Lâhikası', 'Kastamonu Lâhikası', 'Emirdağ Lâhikası', 'Risale-i Nur', 'Diğer'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  publishYear: {
    type: Number
  },
  order: {
    type: Number,
    required: true,
    default: 999
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

// Full-text arama için indeks oluşturma
bookSchema.index({ title: 'text', description: 'text' });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;