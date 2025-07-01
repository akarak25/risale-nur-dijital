const Note = require('../models/Note');

// Kullanıcının tüm notlarını getir
exports.getMyNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const notes = await Note.find({ userId })
      .populate('bookId', 'title coverImage author category')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    console.error('Notlar getirilirken hata oluştu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Notlar getirilirken bir hata oluştu.' 
    });
  }
};

// Kullanıcının belirli bir kitaptaki notlarını getir
exports.getMyNotesByBook = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;
    
    const notes = await Note.find({ userId, bookId })
      .sort({ pageNumber: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    console.error('Kitap notları getirilirken hata oluştu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Kitap notları getirilirken bir hata oluştu.' 
    });
  }
};

// Kullanıcının belirli bir sayfadaki notlarını getir
exports.getMyNotesByPage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, pageNumber } = req.params;
    
    const notes = await Note.find({ 
      userId, 
      bookId, 
      pageNumber: parseInt(pageNumber) 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    console.error('Sayfa notları getirilirken hata oluştu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Sayfa notları getirilirken bir hata oluştu.' 
    });
  }
};

// Yeni not ekle
exports.addNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, pageNumber, content, position, color } = req.body;
    
    // Gerekli alanlar kontrolü
    if (!bookId || pageNumber === undefined || !content || !position) {
      return res.status(400).json({ 
        success: false,
        error: 'Kitap, sayfa numarası, içerik ve pozisyon alanları zorunludur.' 
      });
    }
    
    const newNote = new Note({
      userId,
      bookId,
      pageNumber,
      content,
      position,
      color: color || '#f1c40f'
    });
    
    const savedNote = await newNote.save();
    
    // Populate ile kitap bilgilerini getir
    await savedNote.populate('bookId', 'title coverImage author category');
    
    res.status(201).json({
      success: true,
      data: savedNote
    });
  } catch (error) {
    console.error('Not eklenirken hata oluştu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Not eklenirken bir hata oluştu.' 
    });
  }
};

// Not güncelle
exports.updateNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { content, position, color } = req.body;
    
    const note = await Note.findOne({ _id: id, userId });
    
    if (!note) {
      return res.status(404).json({ 
        success: false,
        error: 'Not bulunamadı veya size ait değil.' 
      });
    }
    
    if (content) note.content = content;
    if (position) note.position = position;
    if (color) note.color = color;
    note.updatedAt = Date.now();
    
    const updatedNote = await note.save();
    await updatedNote.populate('bookId', 'title coverImage author category');
    
    res.status(200).json({
      success: true,
      data: updatedNote
    });
  } catch (error) {
    console.error('Not güncellenirken hata oluştu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Not güncellenirken bir hata oluştu.' 
    });
  }
};

// Not sil
exports.deleteNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const note = await Note.findOne({ _id: id, userId });
    
    if (!note) {
      return res.status(404).json({ 
        success: false,
        error: 'Not bulunamadı veya size ait değil.' 
      });
    }
    
    await note.deleteOne();
    
    res.status(200).json({ 
      success: true,
      data: {},
      message: 'Not başarıyla silindi.' 
    });
  } catch (error) {
    console.error('Not silinirken hata oluştu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Not silinirken bir hata oluştu.' 
    });
  }
};