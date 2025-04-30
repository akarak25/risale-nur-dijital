const mongoose = require('mongoose');

const dictionarySchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  meaning: {
    type: String,
    required: true,
    trim: true
  },
  example: {
    type: String,
    trim: true
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

// Kelime için indeks
dictionarySchema.index({ word: 'text' });

const Dictionary = mongoose.model('Dictionary', dictionarySchema);

module.exports = Dictionary;