require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// MongoDB'ye bağlan ve indeksleri oluştur
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/risaleNurDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB bağlantısı başarılı');
  
  try {
    console.log('🔄 Mevcut indeksler temizleniyor...');
    
    // Direkt veritabanına erişerek tüm text indekslerini sil
    const db = mongoose.connection.db;
    
    // Books koleksiyonundaki tüm indeksleri listele ve text indekslerini sil
    const bookIndexes = await db.collection('books').indexes();
    for (const index of bookIndexes) {
      if (index.name !== '_id_' && index.key && index.key._fts) {
        try {
          await db.collection('books').dropIndex(index.name);
          console.log(`✅ Books indeksi silindi: ${index.name}`);
        } catch (e) {
          console.log(`⚠️ Books indeksi silinemedi: ${index.name}`);
        }
      }
    }
    
    // Pages koleksiyonundaki tüm indeksleri listele ve text indekslerini sil
    const pageIndexes = await db.collection('pages').indexes();
    for (const index of pageIndexes) {
      if (index.name !== '_id_' && index.key && index.key._fts) {
        try {
          await db.collection('pages').dropIndex(index.name);
          console.log(`✅ Pages indeksi silindi: ${index.name}`);
        } catch (e) {
          console.log(`⚠️ Pages indeksi silinemedi: ${index.name}`);
        }
      }
    }
    
    // Dictionary koleksiyonundaki tüm indeksleri listele ve text indekslerini sil
    const dictIndexes = await db.collection('dictionaries').indexes();
    for (const index of dictIndexes) {
      if (index.name !== '_id_' && index.key && index.key._fts) {
        try {
          await db.collection('dictionaries').dropIndex(index.name);
          console.log(`✅ Dictionary indeksi silindi: ${index.name}`);
        } catch (e) {
          console.log(`⚠️ Dictionary indeksi silinemedi: ${index.name}`);
        }
      }
    }
    
    console.log('🔄 Yeni indeksler oluşturuluyor...');
    
    // Yeni indeksleri oluştur
    await db.collection('books').createIndex({
      title: 'text',
      description: 'text',
      author: 'text'
    }, { 
      name: 'book_text_search',
      default_language: 'none'  // Türkçe karakterler için none kullan
    });
    console.log('✅ Kitaplar için metin indeksi oluşturuldu');
    
    await db.collection('pages').createIndex({
      content: 'text',
      chapter: 'text',
      subChapter: 'text'
    }, { 
      name: 'page_text_search',
      default_language: 'none'
    });
    console.log('✅ Sayfalar için metin indeksi oluşturuldu');
    
    await db.collection('dictionaries').createIndex({
      word: 'text',
      meaning: 'text'
    }, { 
      name: 'dict_text_search',
      default_language: 'none'
    });
    console.log('✅ Sözlük için metin indeksi oluşturuldu');
    
    // Diğer performans indeksleri
    await db.collection('pages').createIndex({ pageNumber: 1 }, { background: true });
    console.log('✅ Sayfa numarası indeksi oluşturuldu');
    
    await db.collection('pages').createIndex({ bookId: 1 }, { background: true });
    console.log('✅ Kitap ID indeksi oluşturuldu');
    
    await db.collection('books').createIndex({ category: 1 }, { background: true });
    console.log('✅ Kategori indeksi oluşturuldu');
    
    console.log('\n🎉 Tüm MongoDB indeksleri başarıyla oluşturuldu!');
    console.log('📚 Arama sistemi hazır');
    console.log('🚀 Artık projeyi başlatabilirsiniz: npm run dev');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ İndeks işlemi hatası:', error.message);
    console.log('\n💡 Sorun devam ederse projeyi indeks olmadan da çalıştırabilirsiniz.');
    console.log('   Arama özelliği çalışmayabilir ama diğer özellikler normal çalışacaktır.');
    process.exit(0); // Hata olsa da devam et
  }
})
.catch(err => {
  console.error('❌ MongoDB bağlantı hatası:', err);
  process.exit(1);
});
