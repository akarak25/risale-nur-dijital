const Bookmark = require('../models/Bookmark');

// Kullanıcının tüm yer imlerini getir
exports.getMyBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookmarks = await Bookmark.find({ userId })
      .populate('bookId', 'title coverImage author category')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: bookmarks.length,
      data: bookmarks
    });
  } catch (error) {
    console.error('Yer imleri getirilirken hata oluştu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Yer imleri getirilirken bir hata oluştu.' 
    });
  }
};

// Kullanıcının belirli bir kitaptaki yer imlerini getir
exports.getMyBookmarksByBook = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;
    
    const bookmarks = await Bookmark.find({ userId, bookId })
      .sort({ pageNumber: 1 });
    
    res.status(200).json({
      success: true,
      count: bookmarks.length,
      data: bookmarks
    });
  } catch (error) {
    console.error('Kitap yer imleri getirilirken hata oluştu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Kitap yer imleri getirilirken bir hata oluştu.' 
    });
  }
};

// Yeni yer imi ekle
exports.addBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, pageNumber, name, color } = req.body;
    
    // Gerekli alanlar kontrolü
    if (!bookId || !pageNumber || !name) {
      return res.status(400).json({ 
        success: false,
        error: 'Kitap, sayfa numarası ve isim alanları zorunludur.' 
      });
    }
    
    // Aynı sayfaya birden fazla yer imi eklenmesini engelle
    const existingBookmark = await Bookmark.findOne({ userId, bookId, pageNumber });
    if (existingBookmark) {
      return res.status(400).json({ 
        success: false,
        error: 'Bu sayfada zaten bir yer imi bulunuyor.' 
      });
    }
    
    const newBookmark = new Bookmark({
      userId,
      bookId,
      pageNumber,
      name,
      color: color || '#3498db'
    });
    
    const savedBookmark = await newBookmark.save();
    
    // Populate ile kitap bilgilerini getir
    await savedBookmark.populate('bookId', 'title coverImage author category');
    
    res.status(201).json({
      success: true,
      data: savedBookmark
    });
  } catch (error) {
    console.error('Yer imi eklenirken hata oluştu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Yer imi eklenirken bir hata oluştu.' 
    });
  }
};

// Yer imi güncelle
exports.updateBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, color } = req.body;
    
    const bookmark = await Bookmark.findOne({ _id: id, userId });
    
    if (!bookmark) {
      return res.status(404).json({ 
        success: false,
        error: 'Yer imi bulunamadı veya size ait değil.' 
      });
    }
    
    bookmark.name = name || bookmark.name;
    bookmark.color = color || bookmark.color;
    
    const updatedBookmark = await bookmark.save();
    await updatedBookmark.populate('bookId', 'title coverImage author category');
    
    res.status(200).json({
      success: true,
      data: updatedBookmark
    });
  } catch (error) {
    console.error('Yer imi güncellenirken hata oluştu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Yer imi güncellenirken bir hata oluştu.' 
    });
  }
};

// Yer imi sil
exports.deleteBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const bookmark = await Bookmark.findOne({ _id: id, userId });
    
    if (!bookmark) {
      return res.status(404).json({ 
        success: false,
        error: 'Yer imi bulunamadı veya size ait değil.' 
      });
    }
    
    await bookmark.deleteOne();
    
    res.status(200).json({ 
      success: true,
      data: {},
      message: 'Yer imi başarıyla silindi.' 
    });
  } catch (error) {
    console.error('Yer imi silinirken hata oluştu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Yer imi silinirken bir hata oluştu.' 
    });
  }
};