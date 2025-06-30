const simpleSearch = require('../config/simple-search');
const Dictionary = require('../models/Dictionary');

// Basit metni arama
exports.basicSearch = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Arama sorgusu boş olamaz.' });
    }
    
    // Basit arama sistemini kullan
    const pages = await simpleSearch.searchPages(query);
    
    // Sonuçları düzenle
    const results = pages.map(page => ({
      bookId: page.bookId._id,
      bookTitle: page.bookId.title,
      bookCategory: page.bookId.category || 'Risale-i Nur',
      pageNumber: page.pageNumber,
      pageContent: page.content,
      chapter: page.chapter,
      subChapter: page.subChapter,
      highlightedContent: page.content.replace(
        new RegExp(query, 'gi'),
        match => `<mark>${match}</mark>`
      )
    }));
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Arama yapılırken hata oluştu:', error);
    res.status(500).json({ message: 'Arama yapılırken bir hata oluştu.' });
  }
};

// MongoDB tabanlı gelişmiş arama
exports.advancedSearch = async (req, res) => {
  try {
    const { query, bookId, category, exactPhrase } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Arama sorgusu boş olamaz.' });
    }
    
    // Basit arama sisteminin gelişmiş arama özelliğini kullan
    const pages = await simpleSearch.advancedSearch({
      query,
      bookId,
      category,
      exactPhrase: exactPhrase === 'true'
    });
    
    // Sonuçları düzenle
    const results = pages.map(page => ({
      bookId: page.bookId._id,
      bookTitle: page.bookId.title,
      bookCategory: page.bookId.category || 'Risale-i Nur',
      pageNumber: page.pageNumber,
      pageContent: page.content,
      chapter: page.chapter,
      subChapter: page.subChapter,
      highlightedContent: page.content.replace(
        new RegExp(query, exactPhrase === 'true' ? 'g' : 'gi'),
        match => `<mark>${match}</mark>`
      )
    }));
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Gelişmiş arama yapılırken hata oluştu:', error);
    res.status(500).json({ message: 'Gelişmiş arama yapılırken bir hata oluştu.' });
  }
};

// Kelime anlamı ara
exports.searchWord = async (req, res) => {
  try {
    const { word } = req.params;
    
    if (!word || word.trim() === '') {
      return res.status(400).json({ message: 'Kelime boş olamaz.' });
    }
    
    // Sözlük araması yap
    const results = await simpleSearch.searchDictionary(word);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Kelime sözlükte bulunamadı.' });
    }
    
    // İlk sonucu döndür (en yakın eşleşme)
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Kelime anlamı aranırken hata oluştu:', error);
    res.status(500).json({ message: 'Kelime anlamı aranırken bir hata oluştu.' });
  }
};

// Kitap araması
exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Arama sorgusu boş olamaz.' });
    }
    
    const books = await simpleSearch.searchBooks(query);
    res.status(200).json(books);
  } catch (error) {
    console.error('Kitap arama hatası:', error);
    res.status(500).json({ message: 'Kitap arama yapılırken bir hata oluştu.' });
  }
};
