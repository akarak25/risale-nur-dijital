require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Book = require('../models/Book');
const Page = require('../models/Page');
const Dictionary = require('../models/Dictionary');

// Osmanlıca karakterleri düzeltmek için yardımcı fonksiyon
function normalizeOttomanText(text) {
  // Osmanlıca karakterleri modern Türkçe karakterlere dönüştür
  const replacements = {
    'ٱ': 'ا', // Elif
    'ڭ': 'ن', // Kef-i farisi
    'ڪ': 'ك', // Kef
    'ى': 'ي', // Ya
    // Daha fazla karakter eklenebilir
  };
  
  let normalizedText = text;
  for (const [oldChar, newChar] of Object.entries(replacements)) {
    normalizedText = normalizedText.replace(new RegExp(oldChar, 'g'), newChar);
  }
  
  return normalizedText;
}

// Kelime ayıklama fonksiyonu (sözlük için)
function extractWords(text) {
  // Osmanlıca/Arapça kelimeleri tespit et
  const ottomanWords = text.match(/[\u0600-\u06FF]+/g) || [];
  return [...new Set(ottomanWords)]; // Tekrarları kaldır
}

async function importBooksFromDirectory(booksDirectory) {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/risaleNurDB');
    console.log('MongoDB bağlantısı başarılı');
    
    // Kitaplar dizinindeki klasörleri oku
    const bookFolders = await fs.readdir(booksDirectory);
    
    for (const bookFolder of bookFolders) {
      const bookPath = path.join(booksDirectory, bookFolder);
      const stat = await fs.stat(bookPath);
      
      if (!stat.isDirectory()) continue;
      
      // Kitap metadata dosyasını oku (metadata.json)
      const metadataPath = path.join(bookPath, 'metadata.json');
      let metadata;
      
      try {
        const metadataContent = await fs.readFile(metadataPath, 'utf8');
        metadata = JSON.parse(metadataContent);
      } catch (err) {
        console.log(`${bookFolder} için metadata.json bulunamadı, varsayılan değerler kullanılacak`);
        metadata = {
          title: bookFolder,
          author: "Bediüzzaman Said Nursi",
          category: "Diğer",
          description: `${bookFolder} kitabı`,
          coverImage: `/covers/${bookFolder}.jpg`,
          publishYear: 1900,
          order: 99
        };
      }
      
      // Kitabı veritabanına ekle
      const book = new Book({
        title: metadata.title,
        author: metadata.author,
        coverImage: metadata.coverImage,
        totalPages: 0, // Sonra güncellenecek
        category: metadata.category,
        description: metadata.description,
        publishYear: metadata.publishYear,
        order: metadata.order
      });
      
      const savedBook = await book.save();
      console.log(`Kitap eklendi: ${metadata.title}`);
      
      // Sayfa dosyalarını oku
      const pageFiles = await fs.readdir(bookPath);
      const pageFilesSorted = pageFiles
        .filter(file => file.endsWith('.txt') || file.endsWith('.json'))
        .sort((a, b) => {
          const pageNumA = parseInt(a.match(/\d+/)?.[0] || '0');
          const pageNumB = parseInt(b.match(/\d+/)?.[0] || '0');
          return pageNumA - pageNumB;
        });
      
      let pageCount = 0;
      const wordsForDictionary = new Set();
      
      for (const pageFile of pageFilesSorted) {
        const pagePath = path.join(bookPath, pageFile);
        const pageContent = await fs.readFile(pagePath, 'utf8');
        
        let pageData;
        if (pageFile.endsWith('.json')) {
          pageData = JSON.parse(pageContent);
        } else {
          // Düz metin dosyası
          const pageNumber = parseInt(pageFile.match(/\d+/)?.[0] || '1');
          pageData = {
            pageNumber,
            content: normalizeOttomanText(pageContent),
            chapter: '',
            subChapter: ''
          };
        }
        
        // Sayfayı veritabanına ekle
        const page = new Page({
          bookId: savedBook._id,
          pageNumber: pageData.pageNumber,
          content: pageData.content,
          chapter: pageData.chapter || '',
          subChapter: pageData.subChapter || ''
        });
        
        await page.save();
        pageCount++;
        
        // Osmanlıca kelimeleri topla
        const words = extractWords(pageData.content);
        words.forEach(word => wordsForDictionary.add(word));
        
        console.log(`  - Sayfa ${pageData.pageNumber} eklendi`);
      }
      
      // Kitabın toplam sayfa sayısını güncelle
      savedBook.totalPages = pageCount;
      await savedBook.save();
      
      // Sözlüğe yeni kelimeleri ekle
      for (const word of wordsForDictionary) {
        try {
          // Kelime zaten varsa ekleme
          const existing = await Dictionary.findOne({ word });
          if (!existing) {
            await Dictionary.create({
              word,
              meaning: 'Henüz anlamı eklenmemiş', // Sonradan güncellenecek
              example: ''
            });
          }
        } catch (err) {
          // Kelime ekleme hatası, devam et
        }
      }
      
      console.log(`${metadata.title} başarıyla eklendi (${pageCount} sayfa)\n`);
    }
    
    console.log('Tüm kitaplar başarıyla eklendi!');
    
  } catch (error) {
    console.error('Kitap ekleme hatası:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Kullanım örneği:
// node import-books.js C:/kitaplar
const booksDirectory = process.argv[2];
if (!booksDirectory) {
  console.log('Kullanım: node import-books.js <kitaplar_dizini>');
  console.log('Örnek: node import-books.js C:/risale-nur-kitaplar');
  process.exit(1);
}

importBooksFromDirectory(booksDirectory);