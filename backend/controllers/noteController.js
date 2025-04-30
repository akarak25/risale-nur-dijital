const Note = require('../models/Note');

// Kullanıcının tüm notlarını getir
exports.getUserNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    const notes = await Note.find({ userId }).populate('bookId', 'title');
    
    res.status(200).json(notes);
  } catch (error) {
    console.error('Notlar getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Notlar getirilirken bir hata oluştu.' });
  }
};

// Kullanıcının belirli bir kitaptaki notlarını getir
exports.getNotesByBook = async (req, res) => {
  try {
    const { userId, bookId } = req.params;
    const notes = await Note.find({ userId, bookId }).sort({ pageNumber: 1 });
    
    res.status(200).json(notes);
  } catch (error) {
    console.error('Kitap notları getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Kitap notları getirilirken bir hata oluştu.' });
  }
};

// Kullanıcının belirli bir sayfadaki notlarını getir
exports.getNotesByPage = async (req, res) => {
  try {
    const { userId, bookId, pageNumber } = req.params;
    const notes = await Note.find({ userId, bookId, pageNumber: parseInt(pageNumber) });
    
    res.status(200).json(notes);
  } catch (error) {
    console.error('Sayfa notları getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Sayfa notları getirilirken bir hata oluştu.' });
  }
};

// Yeni not ekle
exports.addNote = async (req, res) => {
  try {
    const { userId, bookId, pageNumber, content, position, color } = req.body;
    
    const newNote = new Note({
      userId,
      bookId,
      pageNumber,
      content,
      position,
      color
    });
    
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error('Not eklenirken hata oluştu:', error);
    res.status(500).json({ message: 'Not eklenirken bir hata oluştu.' });
  }
};

// Not güncelle
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, position, color } = req.body;
    
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: 'Not bulunamadı.' });
    }
    
    if (content) note.content = content;
    if (position) note.position = position;
    if (color) note.color = color;
    
    const updatedNote = await note.save();
    res.status(200).json(updatedNote);
  } catch (error) {
    console.error('Not güncellenirken hata oluştu:', error);
    res.status(500).json({ message: 'Not güncellenirken bir hata oluştu.' });
  }
};

// Not sil
exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: 'Not bulunamadı.' });
    }
    
    await note.remove();
    res.status(200).json({ message: 'Not başarıyla silindi.' });
  } catch (error) {
    console.error('Not silinirken hata oluştu:', error);
    res.status(500).json({ message: 'Not silinirken bir hata oluştu.' });
  }
};