const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// Tüm kitapları getir
router.get('/', bookController.getAllBooks);

// Kategoriye göre kitapları getir
router.get('/category/:category', bookController.getBooksByCategory);

// Belirli bir kitabı getir
router.get('/:id', bookController.getBookById);

// Kitap sayfasını getir
router.get('/:bookId/page/:pageNumber', bookController.getBookPage);

// Kitap içindekiler tablosunu getir
router.get('/:bookId/contents', bookController.getBookContents);

// Yeni kitap ekle (Admin)
router.post('/', bookController.addBook);

// Kitap sayfası ekle (Admin)
router.post('/page', bookController.addBookPage);

module.exports = router;