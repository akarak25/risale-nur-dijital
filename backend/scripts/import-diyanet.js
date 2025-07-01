require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');
const Book = require('../models/Book');
const Page = require('../models/Page');
const Dictionary = require('../models/Dictionary');

// Osmanlıca sözlük verisi
const ottomanDictionary = {
  "بِسْمِ": { meaning: "adıyla, ismiyle", example: "Bismillah - Allah'ın adıyla" },
  "اللّٰهِ": { meaning: "Allah", example: "Yüce yaratıcı" },
  "الرَّحْمٰنِ": { meaning: "Rahman - Dünyada bütün varlıklara merhamet eden", example: "Esirgeyen, bağışlayan" },
  "الرَّحٖيمِ": { meaning: "Rahim - Ahirette müminlere merhamet eden", example: "Çok merhametli" },
  "اَلْحَمْدُ": { meaning: "Hamd, övgü", example: "Elhamdülillah - Allah'a hamd olsun" },
  "رَبِّ": { meaning: "Rab, sahip, terbiye eden", example: "Rabbimiz" },
  "الْعَالَمٖينَ": { meaning: "Âlemler, bütün varlıklar", example: "Rabbü'l-âlemîn" },
  "وَ": { meaning: "ve", example: "Bağlaç" },
  "الصَّلَاةُ": { meaning: "Salât, namaz, dua", example: "Namaz kılmak" },
  "السَّلَامُ": { meaning: "Selam, esenlik", example: "Selamün aleyküm" },
  "عَلٰى": { meaning: "üzerine, üstüne", example: "Üzerine olsun" },
  "سَيِّدِنَا": { meaning: "Efendimiz, önderimiz", example: "Seyyidina" },
  "مُحَمَّدٍ": { meaning: "Muhammed (s.a.v)", example: "Hz. Muhammed" },
  "اٰلِهٖ": { meaning: "Ailesi, soyu", example: "Âl-i Muhammed" },
  "صَحْبِهٖ": { meaning: "Ashabı, arkadaşları", example: "Sahabe-i kiram" },
  "اَجْمَعٖينَ": { meaning: "Hepsi, tamamı", example: "Bütün sahabe" },
  "حقيقت": { meaning: "Hakikat - Gerçek, doğru", example: "Hakikat-i imaniye" },
  "توحيد": { meaning: "Tevhid - Allah'ın birliği", example: "Tevhid inancı" },
  "عالم": { meaning: "Âlem - Dünya, kâinat", example: "Âlem-i İslam" },
  "معنى": { meaning: "Mana - Anlam", example: "Manevi değer" },
  "نور": { meaning: "Nur - Işık", example: "Nur-u Muhammedî" },
  "رسالة": { meaning: "Risale - Mektup, yazılı eser", example: "Risale-i Nur" },
  "كلمة": { meaning: "Kelime - Söz", example: "Kelime-i tevhid" },
  "ايمان": { meaning: "İman - İnanç", example: "İman hakikatleri" },
  "قرآن": { meaning: "Kur'an - Kur'an-ı Kerim", example: "Kur'an ayetleri" },
  "حكمة": { meaning: "Hikmet - Bilgelik", example: "İlahi hikmet" },
  "عبادة": { meaning: "İbadet - Kulluk", example: "İbadet etmek" },
  "معرفة": { meaning: "Marifet - Tanıma, bilme", example: "Marifetullah" },
  "تفسير": { meaning: "Tefsir - Açıklama, yorum", example: "Kur'an tefsiri" },
  "سنة": { meaning: "Sünnet - Hz. Peygamber'in yolu", example: "Sünnet-i seniyye" },
  "شريعة": { meaning: "Şeriat - İslam hukuku", example: "Şeriat hükümleri" },
  "طريقة": { meaning: "Tarikat - Tasavvuf yolu", example: "Tarikat ehli" },
  "حقيقة": { meaning: "Hakikat - Gerçek", example: "Hakikat-i hal" },
  "معرفت": { meaning: "Marifet - İrfan, tanıma", example: "Marifetname" },
  "عقيدة": { meaning: "Akide - İnanç esasları", example: "İslam akidesi" },
  "فقه": { meaning: "Fıkıh - İslam hukuku", example: "Fıkıh ilmi" },
  "تصوف": { meaning: "Tasavvuf - Manevi arınma", example: "Tasavvuf ehli" },
  "ذكر": { meaning: "Zikir - Anma, hatırlama", example: "Allah'ı zikretmek" },
  "دعاء": { meaning: "Dua - Yakarış", example: "Dua etmek" },
  "رحمة": { meaning: "Rahmet - Merhamet", example: "Allah'ın rahmeti" },
  "نعمة": { meaning: "Nimet - Lütuf", example: "İlahi nimetler" },
  "شكر": { meaning: "Şükür - Teşekkür", example: "Şükretmek" },
  "صبر": { meaning: "Sabır - Dayanma", example: "Sabır göstermek" },
  "اخلاص": { meaning: "İhlas - Samimiyet", example: "İhlasla ibadet" },
  "خشوع": { meaning: "Huşu - Saygıyla boyun eğme", example: "Huşu içinde" },
  "تقوى": { meaning: "Takva - Allah'tan korkma", example: "Takva sahibi" },
  "توكل": { meaning: "Tevekkül - Allah'a güvenme", example: "Tevekkül etmek" },
  "استغفار": { meaning: "İstiğfar - Bağışlanma dileme", example: "İstiğfar etmek" },
  "توبة": { meaning: "Tevbe - Pişmanlık", example: "Tevbe etmek" }
};

async function importDiyanetData(sourcePath) {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/risaleNurDB');
    console.log('MongoDB bağlantısı başarılı');
    
    // Önce sözlük kelimelerini ekle
    console.log('Sözlük kelimeleri ekleniyor...');
    for (const [word, data] of Object.entries(ottomanDictionary)) {
      await Dictionary.findOneAndUpdate(
        { word },
        { 
          word,
          meaning: data.meaning,
          example: data.example
        },
        { upsert: true }
      );
    }
    console.log(`${Object.keys(ottomanDictionary).length} sözlük kelimesi eklendi.`);
    
    // HTML klasörünü tara
    const htmlPath = path.join(sourcePath, 'html');
    const bookFolders = await fs.readdir(htmlPath);
    
    for (const bookFolder of bookFolders) {
      const bookPath = path.join(htmlPath, bookFolder);
      const stat = await fs.stat(bookPath);
      
      if (!stat.isDirectory()) continue;
      
      console.log(`\n${bookFolder} işleniyor...`);
      
      // Kitap bilgilerini hazırla
      const bookTitle = bookFolder.replace(/^\d+\s+/, '');
      const bookOrder = parseInt(bookFolder.match(/^\d+/)?.[0] || '99');
      
      const bookData = {
        title: bookTitle,
        author: 'Bediüzzaman Said Nursi',
        coverImage: `/covers/${bookTitle.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')}.jpg`,
        category: getCategoryFromTitle(bookTitle),
        description: `${bookTitle} - Risale-i Nur Külliyatı'nın önemli eserlerinden biridir.`,
        publishYear: getPublishYear(bookTitle),
        order: bookOrder,
        totalPages: 0
      };
      
      // Kitabı ekle veya güncelle
      let book = await Book.findOne({ title: bookTitle });
      if (!book) {
        book = await Book.create(bookData);
        console.log(`Kitap oluşturuldu: ${bookTitle}`);
      } else {
        console.log(`Kitap zaten mevcut: ${bookTitle}`);
      }
      
      // HTML dosyalarını oku
      const htmlFiles = await fs.readdir(bookPath);
      const sortedFiles = htmlFiles
        .filter(f => f.endsWith('.html'))
        .sort((a, b) => {
          const numA = parseFloat(a.match(/[\d.]+/)?.[0] || '0');
          const numB = parseFloat(b.match(/[\d.]+/)?.[0] || '0');
          return numA - numB;
        });
      
      // Her HTML dosyasını işle
      let pageNumber = 0;
      for (const htmlFile of sortedFiles) {
        const filePath = path.join(bookPath, htmlFile);
        const content = await fs.readFile(filePath, 'utf8');
        const $ = cheerio.load(content);
        
        // Ana içeriği al
        const entryContent = $('.entry-content').html() || $('body').html() || content;
        
        // Başlığı al
        const chapter = $('h1').first().text() || 
                       $('h2').first().text() || 
                       htmlFile.replace('.html', '').replace(/[\d.]+\s*/, '');
        
        // Alt başlıkları al
        const subChapters = [];
        $('h3, h4').each((i, el) => {
          subChapters.push($(el).text());
        });
        
        // İçeriği temizle ve böl
        const cleanContent = cleanHtmlContent(entryContent);
        
        // Her bölüm için sayfa oluştur
        if (cleanContent.length > 5000) {
          // Uzun içeriği parçalara böl
          const chunks = splitContent(cleanContent, 5000);
          for (let i = 0; i < chunks.length; i++) {
            pageNumber++;
            await createPage(book._id, pageNumber, chunks[i], chapter, subChapters[i] || '');
          }
        } else {
          // Kısa içerik, tek sayfa
          pageNumber++;
          await createPage(book._id, pageNumber, cleanContent, chapter, '');
        }
      }
      
      // Kitap sayfa sayısını güncelle
      book.totalPages = pageNumber;
      await book.save();
      console.log(`${bookTitle} tamamlandı: ${pageNumber} sayfa`);
    }
    
    console.log('\nTüm kitaplar başarıyla içe aktarıldı!');
    
  } catch (error) {
    console.error('Import hatası:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Yardımcı fonksiyonlar
function getCategoryFromTitle(title) {
  const categoryMap = {
    'Sözler': 'Sözler',
    'Mektubat': 'Mektubat',
    "Lem'alar": "Lem'alar",
    'Şualar': 'Şualar',
    'Şuâlar': 'Şualar',
    'İşarat': "İşarât-ül İ'caz",
    'İşaratü': "İşarât-ül İ'caz",
    'Mesnevî': 'Mesnevî-i Nuriye',
    'Barla': 'Barla Lâhikası',
    'Kastamonu': 'Kastamonu Lâhikası',
    'Emirdağ': 'Emirdağ Lâhikası',
    'Asâ': 'Diğer',
    'Sikke': 'Diğer',
    'Tarihçe': 'Diğer'
  };
  
  for (const [key, value] of Object.entries(categoryMap)) {
    if (title.includes(key)) {
      return value;
    }
  }
  
  return 'Diğer';
}

function getPublishYear(title) {
  const yearMap = {
    'Sözler': 1926,
    'Mektubat': 1929,
    "Lem'alar": 1932,
    'Şualar': 1935,
    'Mesnevî': 1922,
    'İşarat': 1918
  };
  
  for (const [key, year] of Object.entries(yearMap)) {
    if (title.includes(key)) {
      return year;
    }
  }
  
  return 1930;
}

function cleanHtmlContent(html) {
  const $ = cheerio.load(html);
  
  // Gereksiz elementleri kaldır
  $('script, style, noscript').remove();
  
  // Metni al ve temizle
  let text = $.text();
  
  // Fazla boşlukları temizle
  text = text.replace(/\s+/g, ' ').trim();
  
  // HTML olarak geri dön (Osmanlıca metinleri korumak için)
  return $.html();
}

function splitContent(content, maxLength) {
  const chunks = [];
  const $ = cheerio.load(content);
  
  // Paragrafları al
  const paragraphs = $('p').toArray();
  
  let currentChunk = '';
  for (const p of paragraphs) {
    const pHtml = $.html(p);
    if (currentChunk.length + pHtml.length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = pHtml;
    } else {
      currentChunk += pHtml;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks.length > 0 ? chunks : [content];
}

async function createPage(bookId, pageNumber, content, chapter, subChapter) {
  await Page.findOneAndUpdate(
    { bookId, pageNumber },
    {
      bookId,
      pageNumber,
      content,
      chapter: chapter || '',
      subChapter: subChapter || ''
    },
    { upsert: true }
  );
}

// Script'i çalıştır
const sourcePath = process.argv[2] || 'C:\\Users\\Fatih\\Desktop\\Risale-i-Nur-Diyanet';
console.log(`Kaynak dizin: ${sourcePath}`);
importDiyanetData(sourcePath);