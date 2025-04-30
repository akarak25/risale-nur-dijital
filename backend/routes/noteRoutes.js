const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

// Kullanıcının tüm notlarını getir
router.get('/user/:userId', noteController.getUserNotes);

// Kullanıcının belirli bir kitaptaki notlarını getir
router.get('/user/:userId/book/:bookId', noteController.getNotesByBook);

// Kullanıcının belirli bir sayfadaki notlarını getir
router.get('/user/:userId/book/:bookId/page/:pageNumber', noteController.getNotesByPage);

// Yeni not ekle
router.post('/', noteController.addNote);

// Not güncelle
router.put('/:id', noteController.updateNote);

// Not sil
router.delete('/:id', noteController.deleteNote);

module.exports = router;