const Dictionary = require('../models/Dictionary');

// Tüm sözlük kelimelerini getir
exports.getAllWords = async (req, res) => {
  try {
    const words = await Dictionary.find().sort({ word: 1 });
    res.status(200).json(words);
  } catch (error) {
    console.error('Sözlük kelimeleri getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Sözlük kelimeleri getirilirken bir hata oluştu.' });
  }
};

// Belirli bir kelimeyi getir
exports.getWordByName = async (req, res) => {
  try {
    const { word } = req.params;
    
    // Tam eşleşme aramadan önce kelimeyi düzenle
    const normalizedWord = word.trim().toLowerCase();
    
    const dictionaryEntry = await Dictionary.findOne({ 
      word: { $regex: new RegExp('^' + normalizedWord + '$', 'i') }
    });
    
    if (!dictionaryEntry) {
      return res.status(404).json({ message: 'Kelime sözlükte bulunamadı.' });
    }
    
    res.status(200).json(dictionaryEntry);
  } catch (error) {
    console.error('Kelime getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Kelime getirilirken bir hata oluştu.' });
  }
};

// Kelimeyi benzer aramayla getir
exports.searchSimilarWords = async (req, res) => {
  try {
    const { prefix } = req.query;
    
    if (!prefix || prefix.trim() === '') {
      return res.status(400).json({ message: 'Arama öneki boş olamaz.' });
    }
    
    const words = await Dictionary.find({
      word: { $regex: new RegExp('^' + prefix, 'i') }
    }).sort({ word: 1 }).limit(20);
    
    res.status(200).json(words);
  } catch (error) {
    console.error('Benzer kelimeler aranırken hata oluştu:', error);
    res.status(500).json({ message: 'Benzer kelimeler aranırken bir hata oluştu.' });
  }
};

// Yeni kelime ekle (Admin kullanımı için)
exports.addWord = async (req, res) => {
  try {
    const { word, meaning, example } = req.body;
    
    // Kelimenin varlığını kontrol et
    const existingWord = await Dictionary.findOne({ 
      word: { $regex: new RegExp('^' + word + '$', 'i') }
    });
    
    if (existingWord) {
      return res.status(400).json({ message: 'Bu kelime zaten sözlükte bulunuyor.' });
    }
    
    const newWord = new Dictionary({
      word,
      meaning,
      example
    });
    
    const savedWord = await newWord.save();
    res.status(201).json(savedWord);
  } catch (error) {
    console.error('Kelime eklenirken hata oluştu:', error);
    res.status(500).json({ message: 'Kelime eklenirken bir hata oluştu.' });
  }
};

// Kelimeyi güncelle (Admin kullanımı için)
exports.updateWord = async (req, res) => {
  try {
    const { id } = req.params;
    const { word, meaning, example } = req.body;
    
    const dictionaryEntry = await Dictionary.findById(id);
    if (!dictionaryEntry) {
      return res.status(404).json({ message: 'Kelime bulunamadı.' });
    }
    
    dictionaryEntry.word = word || dictionaryEntry.word;
    dictionaryEntry.meaning = meaning || dictionaryEntry.meaning;
    dictionaryEntry.example = example || dictionaryEntry.example;
    
    const updatedWord = await dictionaryEntry.save();
    res.status(200).json(updatedWord);
  } catch (error) {
    console.error('Kelime güncellenirken hata oluştu:', error);
    res.status(500).json({ message: 'Kelime güncellenirken bir hata oluştu.' });
  }
};

// Kelimeyi sil (Admin kullanımı için)
exports.deleteWord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dictionaryEntry = await Dictionary.findById(id);
    if (!dictionaryEntry) {
      return res.status(404).json({ message: 'Kelime bulunamadı.' });
    }
    
    await Dictionary.deleteOne({ _id: id });
    res.status(200).json({ message: 'Kelime başarıyla silindi.' });
  } catch (error) {
    console.error('Kelime silinirken hata oluştu:', error);
    res.status(500).json({ message: 'Kelime silinirken bir hata oluştu.' });
  }
};

// Toplu kelime ekle (Admin kullanımı için)
exports.addBulkWords = async (req, res) => {
  try {
    const { words } = req.body;
    
    if (!words || !Array.isArray(words)) {
      return res.status(400).json({ message: 'Geçersiz kelime listesi.' });
    }
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const wordData of words) {
      try {
        // Kelimenin varlığını kontrol et
        const existingWord = await Dictionary.findOne({ 
          word: wordData.word 
        });
        
        if (!existingWord) {
          await Dictionary.create({
            word: wordData.word,
            meaning: wordData.meaning || 'Henüz anlamı eklenmemiş',
            example: wordData.example || ''
          });
          addedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        // Tek bir kelime hatası tüm işlemi durdurmasın
        console.error(`Kelime eklenirken hata: ${wordData.word}`, error);
      }
    }
    
    res.status(200).json({ 
      message: `${addedCount} kelime eklendi, ${skippedCount} kelime zaten mevcut.`,
      imported: addedCount,  // Frontend bu alanı bekliyor
      added: addedCount,
      skipped: skippedCount,
      total: words.length
    });
    
  } catch (error) {
    console.error('Toplu kelime eklenirken hata oluştu:', error);
    res.status(500).json({ message: 'Toplu kelime eklenirken bir hata oluştu.' });
  }
};