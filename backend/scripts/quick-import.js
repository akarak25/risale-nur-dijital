require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Book = require('../models/Book');
const Page = require('../models/Page');
const Dictionary = require('../models/Dictionary');

// Basit import fonksiyonu
async function quickImport() {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/risaleNurDB');
    console.log('✓ MongoDB bağlantısı başarılı\n');
    
    // Mevcut kitabı kontrol et
    let sampleBook = await Book.findOne({ title: 'Sözler' });
    
    if (sampleBook) {
      console.log('× Sözler kitabı zaten mevcut, sayfalar güncelleniyor...');
      // Mevcut sayfaları sil
      await Page.deleteMany({ bookId: sampleBook._id });
    } else {
      // Yeni kitap ekle
      sampleBook = await Book.create({
        title: 'Sözler',
        author: 'Bediüzzaman Said Nursi',
        coverImage: '/covers/sozler.jpg',
        category: 'Sözler',
        description: 'Risale-i Nur Külliyatı\'nın ilk ve en temel eseri olan Sözler, iman hakikatlerini açıklayan 33 Söz\'den oluşur.',
        publishYear: 1926,
        order: 1,
        totalPages: 3
      });
      console.log('✓ Örnek kitap eklendi: Sözler');
    }
    
    // Örnek sayfalar ekle
    const samplePages = [
      {
        bookId: sampleBook._id,
        pageNumber: 1,
        content: `<h1>Birinci Söz</h1>
<p><strong>Bismillah</strong> her hayrın başıdır. Biz dahi başta ona başlarız.</p>
<p>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ</p>
<p>Bil ey nefsim, şu mübarek kelime İslâm nişanı olduğu gibi bütün mevcudatın lisan-ı haliyle vird-i zebanıdır.</p>`,
        chapter: 'Birinci Söz',
        subChapter: 'Bismillah'
      },
      {
        bookId: sampleBook._id,
        pageNumber: 2,
        content: `<p>Bismillah ne büyük tükenmez bir kuvvet, ne çok bitmez bir bereket olduğunu anlamak istersen şu temsilî hikâyeciğe bak, dinle.</p>
<p>Bedevî Arap çöllerinde seyahat eden adama gerektir ki bir kabile reisinin ismini alsın ve himayesine girsin.</p>`,
        chapter: 'Birinci Söz',
        subChapter: ''
      },
      {
        bookId: sampleBook._id,
        pageNumber: 3,
        content: `<p>İşte ey mağrur nefsim, sen o seyyahsın. Şu dünya ise bir çöldür. Aczin ve fakrın hadsizdir.</p>
<p>Madem öyledir, şu sahranın Mâlik-i Ebedî'si ve Hâkim-i Ezelî'sinin ismini al.</p>`,
        chapter: 'Birinci Söz',
        subChapter: ''
      }
    ];
    
    for (const pageData of samplePages) {
      await Page.create(pageData);
    }
    
    console.log('✓ 3 örnek sayfa eklendi');
    
    // Örnek sözlük kelimeleri ekle
    const sampleWords = [
      { word: 'بِسْمِ', meaning: 'adıyla, ismiyle', example: 'Bismillah - Allah\'ın adıyla' },
      { word: 'اللّٰهِ', meaning: 'Allah', example: 'Yüce yaratıcı' },
      { word: 'الرَّحْمٰنِ', meaning: 'Rahman - Dünyada bütün varlıklara merhamet eden', example: 'Esirgeyen' },
      { word: 'الرَّحٖيمِ', meaning: 'Rahim - Ahirette müminlere merhamet eden', example: 'Çok merhametli' }
    ];
    
    for (const word of sampleWords) {
      await Dictionary.findOneAndUpdate(
        { word: word.word },
        word,
        { upsert: true }
      );
    }
    
    console.log('✓ 4 sözlük kelimesi eklendi\n');
    
    console.log('✅ Test içeriği başarıyla eklendi!');
    console.log('🌐 Siteyi ziyaret edebilirsiniz: http://localhost:8080');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

// Scripti çalıştır
quickImport();