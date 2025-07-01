const mongoose = require('mongoose');
const Book = require('../models/Book');
const Page = require('../models/Page');

// Tüm kitapları getir
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ order: 1 });
    res.status(200).json(books);
  } catch (error) {
    console.error('Kitaplar getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Kitaplar getirilirken bir hata oluştu.' });
  }
};

// Kitap kategorilerine göre getir
exports.getBooksByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const books = await Book.find({ category }).sort({ order: 1 });
    res.status(200).json(books);
  } catch (error) {
    console.error('Kategori kitapları getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Kategori kitapları getirilirken bir hata oluştu.' });
  }
};

// Belirli bir kitabı getir
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({ message: 'Kitap bulunamadı.' });
    }
    
    res.status(200).json(book);
  } catch (error) {
    console.error('Kitap getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Kitap getirilirken bir hata oluştu.' });
  }
};

// Kitap sayfasını getir
exports.getBookPage = async (req, res) => {
  try {
    const { bookId, pageNumber } = req.params;
    const page = await Page.findOne({ bookId, pageNumber: parseInt(pageNumber) });
    
    if (!page) {
      return res.status(404).json({ message: 'Sayfa bulunamadı.' });
    }
    
    res.status(200).json(page);
  } catch (error) {
    console.error('Sayfa getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Sayfa getirilirken bir hata oluştu.' });
  }
};

// Kitap içindekiler tablosunu getir
exports.getBookContents = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    // Kitabın varlığını kontrol et
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Kitap bulunamadı.' });
    }
    
    // Kitabın bölümlerini getir
    const chapters = await Page.aggregate([
      { $match: { bookId: mongoose.Types.ObjectId(bookId), chapter: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { 
        _id: '$chapter', 
        pageNumber: { $first: '$pageNumber' },
        subChapters: { 
          $push: { 
            title: '$subChapter', 
            pageNumber: '$pageNumber' 
          } 
        }
      }},
      { $sort: { pageNumber: 1 } }
    ]);
    
    res.status(200).json(chapters);
  } catch (error) {
    console.error('İçindekiler getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'İçindekiler getirilirken bir hata oluştu.' });
  }
};

// Yeni kitap ekle (Admin kullanımı için)
exports.addBook = async (req, res) => {
  try {
    const { title, coverImage, totalPages, category, description, publishYear, order } = req.body;
    
    const newBook = new Book({
      title,
      coverImage,
      totalPages,
      category,
      description,
      publishYear,
      order
    });
    
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    console.error('Kitap eklenirken hata oluştu:', error);
    res.status(500).json({ message: 'Kitap eklenirken bir hata oluştu.' });
  }
};

// Kitap sayfası ekle (Admin kullanımı için)
exports.addBookPage = async (req, res) => {
  try {
    const { bookId, pageNumber, content, chapter, subChapter } = req.body;
    
    const newPage = new Page({
      bookId,
      pageNumber,
      content,
      chapter,
      subChapter
    });
    
    const savedPage = await newPage.save();
    res.status(201).json(savedPage);
  } catch (error) {
    console.error('Sayfa eklenirken hata oluştu:', error);
    res.status(500).json({ message: 'Sayfa eklenirken bir hata oluştu.' });
  }
};

// Kitap güncelle (Admin kullanımı için)
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const book = await Book.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!book) {
      return res.status(404).json({ message: 'Kitap bulunamadı.' });
    }
    
    res.status(200).json(book);
  } catch (error) {
    console.error('Kitap güncellenirken hata oluştu:', error);
    res.status(500).json({ message: 'Kitap güncellenirken bir hata oluştu.' });
  }
};

// Kitap sil (Admin kullanımı için)
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Önce kitabın sayfalarını sil
    await Page.deleteMany({ bookId: id });
    
    // Sonra kitabı sil
    const book = await Book.findByIdAndDelete(id);
    
    if (!book) {
      return res.status(404).json({ message: 'Kitap bulunamadı.' });
    }
    
    res.status(200).json({ message: 'Kitap ve ilgili sayfalar başarıyla silindi.' });
  } catch (error) {
    console.error('Kitap silinirken hata oluştu:', error);
    res.status(500).json({ message: 'Kitap silinirken bir hata oluştu.' });
  }
};