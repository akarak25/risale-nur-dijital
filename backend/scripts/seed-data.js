require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Model şemalarını oluşturalım (eksik olabilir varsayalım)
const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String },
  pageCount: { type: Number, default: 0 },
  publishYear: { type: Number }
}, { timestamps: true });

const PageSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  pageNumber: { type: Number, required: true },
  content: { type: String, required: true },
  chapter: { type: String },
  subChapter: { type: String }
}, { timestamps: true });

const BookmarkSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  pageNumber: { type: Number, required: true },
  title: { type: String, required: true },
  notes: { type: String }
}, { timestamps: true });

const NoteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  pageNumber: { type: Number, required: true },
  content: { type: String, required: true },
  position: { type: Object }
}, { timestamps: true });

const DictionarySchema = new mongoose.Schema({
  word: { type: String, required: true, unique: true },
  meaning: { type: String, required: true },
  example: { type: String }
}, { timestamps: true });

// Modelleri tanımlayalım
const Book = mongoose.model('Book', BookSchema);
const Page = mongoose.model('Page', PageSchema);
const Bookmark = mongoose.model('Bookmark', BookmarkSchema);
const Note = mongoose.model('Note', NoteSchema);
const Dictionary = mongoose.model('Dictionary', DictionarySchema);

async function seedDatabase() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/risaleNurDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB bağlantısı başarılı');
    
    // Koleksiyonları temizle
    await Book.deleteMany({});
    await Page.deleteMany({});
    await Dictionary.deleteMany({});
    
    console.log('Mevcut veriler temizlendi');
    
    // Örnek kitaplar
    const books = [
      {
        title: "Sözler",
        author: "Bediüzzaman Said Nursi",
        category: "Risale-i Nur",
        description: "Sözler, Risale-i Nur Külliyatı'nın ilk ve en temel eseridir. 33 adet Söz'den oluşur.",
        coverImage: "/covers/sozler.jpg",
        pageCount: 850,
        publishYear: 1926
      },
      {
        title: "Mektubat",
        author: "Bediüzzaman Said Nursi",
        category: "Risale-i Nur",
        description: "Mektubat, Risale-i Nur Külliyatı'nın önemli eserlerinden biridir. 33 adet mektuptan oluşur.",
        coverImage: "/covers/mektubat.jpg",
        pageCount: 540,
        publishYear: 1929
      },
      {
        title: "Lem'alar",
        author: "Bediüzzaman Said Nursi",
        category: "Risale-i Nur",
        description: "Lem'alar, Risale-i Nur Külliyatı'nın parıltılı hakikatleri ihtiva eden eseridir.",
        coverImage: "/covers/lemalar.jpg",
        pageCount: 420,
        publishYear: 1932
      }
    ];
    
    // Kitapları ekle
    const savedBooks = await Book.insertMany(books);
    console.log(`${savedBooks.length} kitap eklendi`);
    
    // Örnek sayfalar
    const pages = [];
    
    // Her kitap için örnek sayfalar oluştur
    for (const book of savedBooks) {
      // Her kitap için 5 örnek sayfa ekleyelim
      for (let i = 1; i <= 5; i++) {
        pages.push({
          bookId: book._id,
          pageNumber: i,
          content: `Bu ${book.title} kitabının ${i}. sayfasıdır. Risale-i Nur Külliyatı'ndan örnek içerik. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
          chapter: i === 1 ? "Giriş" : `Bölüm ${i}`,
          subChapter: i === 1 ? "Önsöz" : `Alt Bölüm ${i}`
        });
      }
    }
    
    // Sayfaları ekle
    const savedPages = await Page.insertMany(pages);
    console.log(`${savedPages.length} sayfa eklendi`);
    
    // Örnek sözlük kelimeleri
    const dictionaryWords = [
      {
        word: "Hakikat",
        meaning: "Gerçek, doğru, asıl, esas.",
        example: "Risale-i Nur Külliyatı hakikat ilimlerini en güzel şekilde açıklar."
      },
      {
        word: "Tevhid",
        meaning: "Allah'ın birliğine inanma, bir sayma, tek kılma.",
        example: "Tevhid inancı İslam'ın temelidir."
      },
      {
        word: "Âlem",
        meaning: "Dünya, kâinat, evren.",
        example: "Bu âlemdeki her şey Allah'ın varlığına işaret eder."
      },
      {
        word: "Lem'a",
        meaning: "Parıltı, ışık, parlaklık.",
        example: "İman hakikatlerinin lem'aları kalpleri aydınlatır."
      },
      {
        word: "Külliyat",
        meaning: "Bir yazarın bütün eserleri, toplanmış eserler.",
        example: "Risale-i Nur Külliyatı birçok kitaptan oluşur."
      }
    ];
    
    // Sözlük kelimelerini ekle
    const savedDictionary = await Dictionary.insertMany(dictionaryWords);
    console.log(`${savedDictionary.length} sözlük kelimesi eklendi`);
    
    console.log('Veritabanı başarıyla dolduruldu!');
    
  } catch (error) {
    console.error('Veri ekleme hatası:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

// Veritabanını doldur
seedDatabase();