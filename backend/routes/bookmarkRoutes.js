const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');

// Kullanıcının tüm yer imlerini getir
router.get('/user/:userId', bookmarkController.getUserBookmarks);

// Kullanıcının belirli bir kitaptaki yer imlerini getir
router.get('/user/:userId/book/:bookId', bookmarkController.getBookmarksByBook);

// Yeni yer imi ekle
router.post('/', bookmarkController.addBookmark);

// Yer imi güncelle
router.put('/:id', bookmarkController.updateBookmark);

// Yer imi sil
router.delete('/:id', bookmarkController.deleteBookmark);

module.exports = router;