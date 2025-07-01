const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

// Tüm note işlemleri için authentication gerekli
router.use(protect);

// Kullanıcının tüm notlarını getir
router.get('/my', noteController.getMyNotes);

// Kullanıcının belirli bir kitaptaki notlarını getir
router.get('/book/:bookId', noteController.getMyNotesByBook);

// Kullanıcının belirli bir sayfadaki notlarını getir
router.get('/book/:bookId/page/:pageNumber', noteController.getMyNotesByPage);

// Yeni not ekle
router.post('/', noteController.addNote);

// Not güncelle
router.put('/:id', noteController.updateNote);

// Not sil
router.delete('/:id', noteController.deleteNote);

module.exports = router;