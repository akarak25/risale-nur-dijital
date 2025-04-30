const express = require('express');
const router = express.Router();
const dictionaryController = require('../controllers/dictionaryController');

// Tüm sözlük kelimelerini getir
router.get('/', dictionaryController.getAllWords);

// Belirli bir kelimeyi getir
router.get('/word/:word', dictionaryController.getWordByName);

// Benzer kelimeleri ara
router.get('/search', dictionaryController.searchSimilarWords);

// Yeni kelime ekle (Admin)
router.post('/', dictionaryController.addWord);

// Kelime güncelle (Admin)
router.put('/:id', dictionaryController.updateWord);

// Kelime sil (Admin)
router.delete('/:id', dictionaryController.deleteWord);

module.exports = router;