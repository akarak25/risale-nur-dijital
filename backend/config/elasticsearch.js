const { Client } = require('elasticsearch');
const Book = require('../models/Book');
const Page = require('../models/Page');

// Elasticsearch istemcisi oluştur
const esClient = new Client({
  node: process.env.ES_HOST || 'http://localhost:9200'
});

// Elasticsearch indekslerini oluştur
const createIndices = async () => {
  try {
    // Kitaplar indeksi
    const bookIndexExists = await esClient.indices.exists({
      index: 'risale_books'
    });
    
    if (!bookIndexExists) {
      await esClient.indices.create({
        index: 'risale_books',
        body: {
          mappings: {
            properties: {
              title: { type: 'text', analyzer: 'turkish' },
              author: { type: 'text', analyzer: 'turkish' },
              category: { type: 'keyword' },
              description: { type: 'text', analyzer: 'turkish' }
            }
          }
        }
      });
      console.log('Kitaplar indeksi oluşturuldu');
    }
    
    // Sayfalar indeksi
    const pageIndexExists = await esClient.indices.exists({
      index: 'risale_pages'
    });
    
    if (!pageIndexExists) {
      await esClient.indices.create({
        index: 'risale_pages',
        body: {
          mappings: {
            properties: {
              bookId: { type: 'keyword' },
              pageNumber: { type: 'integer' },
              content: { type: 'text', analyzer: 'turkish' },
              chapter: { type: 'text', analyzer: 'turkish' },
              subChapter: { type: 'text', analyzer: 'turkish' }
            }
          }
        }
      });
      console.log('Sayfalar indeksi oluşturuldu');
    }
    
    // Sözlük indeksi
    const dictIndexExists = await esClient.indices.exists({
      index: 'risale_dictionary'
    });
    
    if (!dictIndexExists) {
      await esClient.indices.create({
        index: 'risale_dictionary',
        body: {
          mappings: {
            properties: {
              word: { type: 'text', analyzer: 'turkish' },
              meaning: { type: 'text', analyzer: 'turkish' },
              example: { type: 'text', analyzer: 'turkish' }
            }
          }
        }
      });
      console.log('Sözlük indeksi oluşturuldu');
    }
    
    return true;
  } catch (error) {
    console.error('Elasticsearch indeksleri oluşturulurken hata:', error);
    return false;
  }
};

// Veriyi MongoDB'den Elasticsearch'e senkronize et
const syncData = async () => {
  try {
    await createIndices();
    
    // Kitapları senkronize et
    const books = await Book.find();
    const bookOps = [];
    
    for (const book of books) {
      bookOps.push({
        index: {
          _index: 'risale_books',
          _id: book._id.toString()
        }
      });
      
      bookOps.push({
        title: book.title,
        author: book.author,
        category: book.category,
        description: book.description
      });
    }
    
    if (bookOps.length > 0) {
      await esClient.bulk({ body: bookOps });
      console.log(`${books.length} kitap Elasticsearch'e senkronize edildi`);
    }
    
    // Sayfaları senkronize et (büyük veri için toplu işlem)
    const totalPages = await Page.countDocuments();
    const batchSize = 500;
    const batches = Math.ceil(totalPages / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const pages = await Page.find()
        .skip(i * batchSize)
        .limit(batchSize);
      
      const pageOps = [];
      
      for (const page of pages) {
        pageOps.push({
          index: {
            _index: 'risale_pages',
            _id: page._id.toString()
          }
        });
        
        pageOps.push({
          bookId: page.bookId.toString(),
          pageNumber: page.pageNumber,
          content: page.content,
          chapter: page.chapter,
          subChapter: page.subChapter
        });
      }
      
      if (pageOps.length > 0) {
        await esClient.bulk({ body: pageOps });
        console.log(`Sayfa ${i * batchSize + 1} - ${Math.min((i + 1) * batchSize, totalPages)} Elasticsearch'e senkronize edildi`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Veri senkronizasyonu sırasında hata:', error);
    return false;
  }
};

module.exports = {
  esClient,
  createIndices,
  syncData
};