const Book = require('../models/Book');
const Page = require('../models/Page');
const Dictionary = require('../models/Dictionary');

// Basit metni arama
exports.basicSearch = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Arama sorgusu boş olamaz.' });
    }
    
    // Sayfalarda arama yap
    const pages = await Page.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .populate('bookId', 'title category')
    .limit(50);
    
    // Sonuçları eşsiz kitaplara göre grupla
    const results = pages.map(page => ({
      bookId: page.bookId._id,
      bookTitle: page.bookId.title,
      bookCategory: page.bookId.category,
      pageNumber: page.pageNumber,
      pageContent: page.content,
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

// Elasticsearch ile gelişmiş arama
exports.advancedSearch = async (req, res) => {
  try {
    const { query, bookId, category, exactPhrase } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Arama sorgusu boş olamaz.' });
    }
    
    // Elasticsearch sorgusu oluştur
    const esQuery = {
      index: 'risale_pages',
      body: {
        query: {
          bool: {
            must: []
          }
        },
        highlight: {
          fields: {
            content: {}
          },
          pre_tags: ['<mark>'],
          post_tags: ['</mark>']
        }
      }
    };
    
    // Tam kelime veya ifade arama
    if (exactPhrase === 'true') {
      esQuery.body.query.bool.must.push({
        match_phrase: {
          content: query
        }
      });
    } else {
      esQuery.body.query.bool.must.push({
        match: {
          content: {
            query: query,
            fuzziness: 'AUTO'
          }
        }
      });
    }
    
    // Belirli bir kitaba göre filtrele
    if (bookId) {
      esQuery.body.query.bool.must.push({
        term: {
          bookId: bookId
        }
      });
    }
    
    // Belirli bir kategoriye göre filtrele
    if (category) {
      // Kategori filtrelemesi için önce kitap ID'lerini bul
      const books = await Book.find({ category });
      const bookIds = books.map(book => book._id.toString());
      
      esQuery.body.query.bool.must.push({
        terms: {
          bookId: bookIds
        }
      });
    }
    
    const response = await req.esClient.search(esQuery);
    
    // Elasticsearch sonuçlarını işle
    const esResults = response.hits.hits.map(async hit => {
      const page = await Page.findOne({ 
        _id: hit._id 
      }).populate('bookId', 'title category');
      
      return {
        bookId: page.bookId._id,
        bookTitle: page.bookId.title,
        bookCategory: page.bookId.category,
        pageNumber: page.pageNumber,
        pageContent: page.content,
        highlightedContent: hit.highlight.content.join('...')
      };
    });
    
    const results = await Promise.all(esResults);
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
    
    // Kelimeyi sözlükte ara
    const dictionaryEntry = await Dictionary.findOne({ 
      $text: { $search: word }
    });
    
    if (!dictionaryEntry) {
      return res.status(404).json({ message: 'Kelime sözlükte bulunamadı.' });
    }
    
    res.status(200).json(dictionaryEntry);
  } catch (error) {
    console.error('Kelime anlamı aranırken hata oluştu:', error);
    res.status(500).json({ message: 'Kelime anlamı aranırken bir hata oluştu.' });
  }
};