// MongoDB tabanlı basit arama sistemi
const Book = require('../models/Book');
const Page = require('../models/Page');
const Dictionary = require('../models/Dictionary');

class SimpleSearch {
  // Basit metin araması
  async searchBooks(query) {
    try {
      const books = await Book.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { author: { $regex: query, $options: 'i' } }
        ]
      });
      return books;
    } catch (error) {
      console.error('Kitap arama hatası:', error);
      return [];
    }
  }

  // Sayfa içerik araması
  async searchPages(query, bookId = null) {
    try {
      const searchQuery = {
        $or: [
          { content: { $regex: query, $options: 'i' } },
          { chapter: { $regex: query, $options: 'i' } },
          { subChapter: { $regex: query, $options: 'i' } }
        ]
      };

      if (bookId) {
        searchQuery.bookId = bookId;
      }

      const pages = await Page.find(searchQuery)
        .populate('bookId', 'title author')
        .limit(50);
      
      return pages;
    } catch (error) {
      console.error('Sayfa arama hatası:', error);
      return [];
    }
  }

  // Sözlük araması
  async searchDictionary(word) {
    try {
      const results = await Dictionary.find({
        $or: [
          { word: { $regex: word, $options: 'i' } },
          { meaning: { $regex: word, $options: 'i' } }
        ]
      }).limit(10);
      
      return results;
    } catch (error) {
      console.error('Sözlük arama hatası:', error);
      return [];
    }
  }

  // Gelişmiş arama
  async advancedSearch({ query, bookId, category, exactPhrase }) {
    try {
      let searchQuery = {};
      
      if (exactPhrase) {
        searchQuery.content = { $regex: `\\b${query}\\b`, $options: 'i' };
      } else {
        searchQuery.content = { $regex: query, $options: 'i' };
      }

      if (bookId) {
        searchQuery.bookId = bookId;
      }

      const pages = await Page.find(searchQuery)
        .populate('bookId', 'title author category')
        .limit(100);

      // Kategori filtresi
      if (category) {
        return pages.filter(page => 
          page.bookId && page.bookId.category === category
        );
      }

      return pages;
    } catch (error) {
      console.error('Gelişmiş arama hatası:', error);
      return [];
    }
  }
}

module.exports = new SimpleSearch();
