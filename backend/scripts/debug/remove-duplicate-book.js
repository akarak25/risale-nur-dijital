require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Book = require('../../models/Book');
const Page = require('../../models/Page');

async function removeDuplicateBook() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/risaleNurDB');
    console.log('✓ MongoDB bağlantısı başarılı\n');
    
    // 3 sayfalık Sözler kitabını bul ve sil
    const duplicateBook = await Book.findOne({ 
      _id: '6864da98ead7ba1a9c17e5e2',
      totalPages: 3 
    });
    
    if (duplicateBook) {
      console.log(`📚 Silinecek kitap bulundu: ${duplicateBook.title} (${duplicateBook.totalPages} sayfa)`);
      
      // Bu kitaba ait sayfaları sil
      const deletedPages = await Page.deleteMany({ bookId: duplicateBook._id });
      console.log(`✓ ${deletedPages.deletedCount} sayfa silindi`);
      
      // Kitabı sil
      await Book.deleteOne({ _id: duplicateBook._id });
      console.log(`✓ Kitap silindi`);
    } else {
      console.log('⚠️  Silinecek kitap bulunamadı');
    }
    
    // Kalan kitapları listele
    console.log('\n📖 Mevcut kitaplar:');
    const remainingBooks = await Book.find().sort({ order: 1 });
    remainingBooks.forEach(book => {
      console.log(`  - ${book.title} (${book.totalPages} sayfa)`);
    });
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Veritabanı bağlantısı kapatıldı');
  }
}

removeDuplicateBook();