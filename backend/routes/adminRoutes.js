const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Page = require('../models/Page');
const Dictionary = require('../models/Dictionary');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');
const { protect, authorize } = require('../middleware/auth');

// Admin middleware - sadece admin rolüne sahip kullanıcılar erişebilir
router.use(protect);
router.use(authorize('admin'));

// Admin istatistikleri
router.get('/stats', async (req, res) => {
  try {
    const [totalBooks, totalPages, totalWords, totalUsers] = await Promise.all([
      Book.countDocuments(),
      Page.countDocuments(),
      Dictionary.countDocuments(),
      User.countDocuments()
    ]);
    
    res.json({
      totalBooks,
      totalPages,
      totalWords,
      totalUsers
    });
  } catch (error) {
    console.error('İstatistik hatası:', error);
    res.status(500).json({ message: 'İstatistikler alınamadı' });
  }
});

// Diyanet verilerini içe aktar
router.post('/import/diyanet', async (req, res) => {
  try {
    const { bookId, format, sourcePath } = req.body;
    
    // Kitap klasör yolunu belirle
    const bookMap = {
      '01_sozler': '01 Sözler',
      '02_mektubat': '02 Mektubat',
      '03_lemalar': "03 Lem'alar",
      '04_sualar': '04 Şuâlar',
      '05_tarihce': '05 Tarihçe-i Hayat',
      '06_mesnevi': '06 Mesnevî-i Nuriye',
      '07_isarat': "07 İşaratü'l-i'caz",
      '08_sikke': '08 Sikke-i Tasdik-i Gaybî',
      '09_barla': '09 Barla Lâhikası',
      '10_kastamonu': '10 Kastamonu Lâhikası',
      '11_emirdag1': '11 Emirdağ Lâhikası 1',
      '12_emirdag2': '12 Emirdağ Lâhikası 2',
      '13_asa': '13 Asâ-yı Musa',
      '14_kucuk': '14 Küçük Kitaplar'
    };
    
    const bookFolder = bookMap[bookId];
    if (!bookFolder) {
      return res.status(400).json({ message: 'Geçersiz kitap ID' });
    }
    
    const bookPath = path.join(sourcePath, format, bookFolder);
    
    // Kitap bilgilerini hazırla
    const bookTitle = bookFolder.replace(/^\d+\s+/, '');
    const bookData = {
      title: bookTitle,
      author: 'Bediüzzaman Said Nursi',
      coverImage: `/covers/${bookId}.jpg`,
      category: getCategoryFromTitle(bookTitle),
      description: `${bookTitle} - Risale-i Nur Külliyatı`,
      publishYear: 1900,
      order: parseInt(bookFolder.match(/^\d+/)[0])
    };
    
    // Kitabı veritabanına ekle veya güncelle
    let book = await Book.findOne({ title: bookTitle });
    if (!book) {
      book = await Book.create(bookData);
    }
    
    // İçerik dosyalarını oku
    const files = await fs.readdir(bookPath);
    let pageCount = 0;
    const dictionaryWords = new Set();
    
    if (format === 'html') {
      // HTML dosyalarını işle
      for (const file of files) {
        if (!file.endsWith('.html')) continue;
        
        const filePath = path.join(bookPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        const $ = cheerio.load(content);
        
        // Bölüm başlığını al
        const chapter = $('h1, h2').first().text() || file.replace('.html', '');
        
        // İçeriği parçalara ayır (her bölüm bir sayfa olacak)
        const sections = $('.entry-content').html() || content;
        
        // Osmanlıca kelimeleri topla
        const ottomanWords = sections.match(/[\u0600-\u06FF]+/g) || [];
        ottomanWords.forEach(word => dictionaryWords.add(word));
        
        // Sayfayı ekle
        pageCount++;
        await Page.findOneAndUpdate(
          { bookId: book._id, pageNumber: pageCount },
          {
            bookId: book._id,
            pageNumber: pageCount,
            content: sections,
            chapter: chapter,
            subChapter: ''
          },
          { upsert: true }
        );
      }
    } else if (format === 'txt') {
      // TXT dosyalarını işle
      const txtFiles = files.filter(f => f.endsWith('.txt')).sort();
      
      for (let i = 0; i < txtFiles.length; i++) {
        const filePath = path.join(bookPath, txtFiles[i]);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Osmanlıca kelimeleri topla
        const ottomanWords = content.match(/[\u0600-\u06FF]+/g) || [];
        ottomanWords.forEach(word => dictionaryWords.add(word));
        
        // Sayfayı ekle
        pageCount++;
        await Page.findOneAndUpdate(
          { bookId: book._id, pageNumber: pageCount },
          {
            bookId: book._id,
            pageNumber: pageCount,
            content: content,
            chapter: '',
            subChapter: ''
          },
          { upsert: true }
        );
      }
    }
    
    // Kitap sayfa sayısını güncelle
    book.totalPages = pageCount;
    await book.save();
    
    // Yeni kelimeleri sözlüğe ekle
    for (const word of dictionaryWords) {
      await Dictionary.findOneAndUpdate(
        { word },
        { 
          word,
          meaning: 'Henüz anlamı eklenmemiş',
          example: ''
        },
        { upsert: true }
      );
    }
    
    res.json({
      success: true,
      message: `${bookTitle} başarıyla eklendi`,
      pagesImported: pageCount,
      wordsAdded: dictionaryWords.size
    });
    
  } catch (error) {
    console.error('Diyanet import hatası:', error);
    res.status(500).json({ message: 'İçe aktarma hatası: ' + error.message });
  }
});

// Toplu kitap ekleme
router.post('/import/bulk', async (req, res) => {
  try {
    const { path: importPath } = req.body;
    
    // import-books.js scriptini çalıştır
    const { exec } = require('child_process');
    const scriptPath = path.join(__dirname, '../scripts/import-books.js');
    
    exec(`node "${scriptPath}" "${importPath}"`, async (error, stdout, stderr) => {
      if (error) {
        console.error('Import script hatası:', error);
        return res.status(500).json({ message: 'Import hatası: ' + error.message });
      }
      
      console.log('Import çıktısı:', stdout);
      
      // Kaç kitap eklendiğini hesapla
      const bookCount = await Book.countDocuments();
      
      res.json({
        success: true,
        imported: bookCount,
        output: stdout
      });
    });
    
  } catch (error) {
    console.error('Toplu import hatası:', error);
    res.status(500).json({ message: 'İçe aktarma hatası: ' + error.message });
  }
});

// Sözlük içe aktarma
router.post('/dictionary/import', async (req, res) => {
  try {
    const { words } = req.body;
    
    if (!Array.isArray(words)) {
      return res.status(400).json({ message: 'Kelimeler dizi formatında olmalı' });
    }
    
    let imported = 0;
    let updated = 0;
    
    for (const wordData of words) {
      const existing = await Dictionary.findOne({ word: wordData.word });
      
      if (existing) {
        existing.meaning = wordData.meaning;
        existing.example = wordData.example || existing.example;
        await existing.save();
        updated++;
      } else {
        await Dictionary.create({
          word: wordData.word,
          meaning: wordData.meaning,
          example: wordData.example || ''
        });
        imported++;
      }
    }
    
    res.json({
      success: true,
      imported,
      updated,
      total: imported + updated
    });
    
  } catch (error) {
    console.error('Sözlük import hatası:', error);
    res.status(500).json({ message: 'İçe aktarma hatası: ' + error.message });
  }
});

// Kategori belirleme yardımcı fonksiyonu
function getCategoryFromTitle(title) {
  const categoryMap = {
    'Sözler': 'Sözler',
    'Mektubat': 'Mektubat',
    "Lem'alar": "Lem'alar",
    'Şualar': 'Şualar',
    'Şuâlar': 'Şualar',
    'İşarat': 'İşarât-ül İ\'caz',
    'İşaratü': 'İşarât-ül İ\'caz',
    'Mesnevî': 'Mesnevî-i Nuriye',
    'Barla': 'Barla Lâhikası',
    'Kastamonu': 'Kastamonu Lâhikası',
    'Emirdağ': 'Emirdağ Lâhikası'
  };
  
  for (const [key, value] of Object.entries(categoryMap)) {
    if (title.includes(key)) {
      return value;
    }
  }
  
  return 'Diğer';
}

module.exports = router;