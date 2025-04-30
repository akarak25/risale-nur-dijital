const Bookmark = require('../models/Bookmark');

// Kullanıcının tüm yer imlerini getir
exports.getUserBookmarks = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookmarks = await Bookmark.find({ userId }).populate('bookId', 'title coverImage');
    
    res.status(200).json(bookmarks);
  } catch (error) {
    console.error('Yer imleri getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Yer imleri getirilirken bir hata oluştu.' });
  }
};

// Kullanıcının belirli bir kitaptaki yer imlerini getir
exports.getBookmarksByBook = async (req, res) => {
  try {
    const { userId, bookId } = req.params;
    const bookmarks = await Bookmark.find({ userId, bookId }).sort({ pageNumber: 1 });
    
    res.status(200).json(bookmarks);
  } catch (error) {
    console.error('Kitap yer imleri getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Kitap yer imleri getirilirken bir hata oluştu.' });
  }
};

// Yeni yer imi ekle
exports.addBookmark = async (req, res) => {
  try {
    const { userId, bookId, pageNumber, name, color } = req.body;
    
    // Aynı sayfaya birden fazla yer imi eklenmesini engelle
    const existingBookmark = await Bookmark.findOne({ userId, bookId, pageNumber });
    if (existingBookmark) {
      return res.status(400).json({ message: 'Bu sayfada zaten bir yer imi bulunuyor.' });
    }
    
    const newBookmark = new Bookmark({
      userId,
      bookId,
      pageNumber,
      name,
      color
    });
    
    const savedBookmark = await newBookmark.save();
    res.status(201).json(savedBookmark);
  } catch (error) {
    console.error('Yer imi eklenirken hata oluştu:', error);
    res.status(500).json({ message: 'Yer imi eklenirken bir hata oluştu.' });
  }
};

// Yer imi güncelle
exports.updateBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    
    const bookmark = await Bookmark.findById(id);
    if (!bookmark) {
      return res.status(404).json({ message: 'Yer imi bulunamadı.' });
    }
    
    bookmark.name = name || bookmark.name;
    bookmark.color = color || bookmark.color;
    
    const updatedBookmark = await bookmark.save();
    res.status(200).json(updatedBookmark);
  } catch (error) {
    console.error('Yer imi güncellenirken hata oluştu:', error);
    res.status(500).json({ message: 'Yer imi güncellenirken bir hata oluştu.' });
  }
};

// Yer imi sil
exports.deleteBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bookmark = await Bookmark.findById(id);
    if (!bookmark) {
      return res.status(404).json({ message: 'Yer imi bulunamadı.' });
    }
    
    await bookmark.remove();
    res.status(200).json({ message: 'Yer imi başarıyla silindi.' });
  } catch (error) {
    console.error('Yer imi silinirken hata oluştu:', error);
    res.status(500).json({ message: 'Yer imi silinirken bir hata oluştu.' });
  }
};