const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

// Tüm bookmark işlemleri için authentication gerekli
router.use(protect);

// Kullanıcının tüm yer imlerini getir
router.get('/my', bookmarkController.getMyBookmarks);

// Kullanıcının belirli bir kitaptaki yer imlerini getir
router.get('/book/:bookId', bookmarkController.getMyBookmarksByBook);

// Yeni yer imi ekle
router.post('/', bookmarkController.addBookmark);

// Yer imi güncelle
router.put('/:id', bookmarkController.updateBookmark);

// Yer imi sil
router.delete('/:id', bookmarkController.deleteBookmark);

module.exports = router;