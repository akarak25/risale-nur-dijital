require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Book = require('../../models/Book');
const Page = require('../../models/Page');
const Dictionary = require('../../models/Dictionary');

async function checkDatabase() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/risaleNurDB');
    console.log('✓ MongoDB bağlantısı başarılı\n');
    
    // Kitapları kontrol et
    console.log('📚 KİTAPLAR:');
    console.log('='.repeat(50));
    const books = await Book.find().sort({ order: 1 });
    console.log(`Toplam kitap sayısı: ${books.length}\n`);
    
    for (const book of books) {
      console.log(`📖 ${book.title}`);
      console.log(`   ID: ${book._id}`);
      console.log(`   Kategori: ${book.category}`);
      console.log(`   Toplam Sayfa: ${book.totalPages}`);
      console.log(`   Sıra: ${book.order}`);
      
      // Bu kitaba ait sayfaları kontrol et
      const pageCount = await Page.countDocuments({ bookId: book._id });
      console.log(`   Veritabanındaki sayfa sayısı: ${pageCount}`);
      
      // İlk 3 sayfayı göster
      const firstPages = await Page.find({ bookId: book._id })
        .sort({ pageNumber: 1 })
        .limit(3)
        .select('pageNumber content');
      
      if (firstPages.length > 0) {
        console.log('   İlk sayfalar:');
        firstPages.forEach(page => {
          const contentPreview = page.content ? 
            page.content.substring(0, 100).replace(/<[^>]*>/g, '') + '...' : 
            'İçerik yok';
          console.log(`     - Sayfa ${page.pageNumber}: ${contentPreview}`);
        });
      }
      console.log('-'.repeat(50));
    }
    
    // Sayfa istatistikleri
    console.log('\n📄 SAYFA İSTATİSTİKLERİ:');
    console.log('='.repeat(50));
    const totalPages = await Page.countDocuments();
    console.log(`Toplam sayfa sayısı: ${totalPages}`);
    
    // Her kitap için sayfa sayısı
    const pageStats = await Page.aggregate([
      { $group: { _id: '$bookId', count: { $sum: 1 } } }
    ]);
    
    console.log('\nKitap başına sayfa sayıları:');
    for (const stat of pageStats) {
      const book = await Book.findById(stat._id);
      if (book) {
        console.log(`  - ${book.title}: ${stat.count} sayfa`);
      }
    }
    
    // Sözlük istatistikleri
    console.log('\n📖 SÖZLÜK İSTATİSTİKLERİ:');
    console.log('='.repeat(50));
    const dictionaryCount = await Dictionary.countDocuments();
    console.log(`Toplam kelime sayısı: ${dictionaryCount}`);
    
    // Örnek kelimeler
    const sampleWords = await Dictionary.find().limit(5);
    console.log('\nÖrnek kelimeler:');
    sampleWords.forEach(word => {
      console.log(`  - ${word.word}: ${word.meaning}`);
    });
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Veritabanı bağlantısı kapatıldı');
  }
}

checkDatabase();