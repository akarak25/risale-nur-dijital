require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');
const Book = require('../models/Book');
const Page = require('../models/Page');
const Dictionary = require('../models/Dictionary');

// Osmanlıca sözlük verisi (genişletilmiş)
const ottomanDictionary = {
  // Bismillah ve ilgili kelimeler
  "بِسْمِ": { meaning: "adıyla, ismiyle", example: "Bismillah - Allah'ın adıyla" },
  "اللّٰهِ": { meaning: "Allah", example: "Yüce yaratıcı" },
  "الرَّحْمٰنِ": { meaning: "Rahman - Dünyada bütün varlıklara merhamet eden", example: "Esirgeyen, bağışlayan" },
  "الرَّحٖيمِ": { meaning: "Rahim - Ahirette müminlere merhamet eden", example: "Çok merhametli" },
  
  // Hamd ve dua ile ilgili
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
  
  // Temel İslami kavramlar
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
  
  // İbadet ve maneviyat
  "عبادة": { meaning: "İbadet - Kulluk", example: "İbadet etmek" },
  "معرفة": { meaning: "Marifet - Tanıma, bilme", example: "Marifetullah" },
  "تفسير": { meaning: "Tefsir - Açıklama, yorum", example: "Kur'an tefsiri" },
  "سنة": { meaning: "Sünnet - Hz. Peygamber'in yolu", example: "Sünnet-i seniyye" },
  "شريعة": { meaning: "Şeriat - İslam hukuku", example: "Şeriat hükümleri" },
  "طريقة": { meaning: "Tarikat - Tasavvuf yolu", example: "Tarikat ehli" },
  "حقيقة": { meaning: "Hakikat - Gerçek", example: "Hakikat-i hal" },
  "معرفت": { meaning: "Marifet - İrfan, tanıma", example: "Marifetname" },
  
  // İnanç esasları
  "عقيدة": { meaning: "Akide - İnanç esasları", example: "İslam akidesi" },
  "فقه": { meaning: "Fıkıh - İslam hukuku", example: "Fıkıh ilmi" },
  "تصوف": { meaning: "Tasavvuf - Manevi arınma", example: "Tasavvuf ehli" },
  "ذكر": { meaning: "Zikir - Anma, hatırlama", example: "Allah'ı zikretmek" },
  "دعاء": { meaning: "Dua - Yakarış", example: "Dua etmek" },
  "رحمة": { meaning: "Rahmet - Merhamet", example: "Allah'ın rahmeti" },
  "نعمة": { meaning: "Nimet - Lütuf", example: "İlahi nimetler" },
  "شكر": { meaning: "Şükür - Teşekkür", example: "Şükretmek" },
  "صبر": { meaning: "Sabır - Dayanma", example: "Sabır göstermek" },
  
  // Manevi kavramlar
  "اخلاص": { meaning: "İhlas - Samimiyet", example: "İhlasla ibadet" },
  "خشوع": { meaning: "Huşu - Saygıyla boyun eğme", example: "Huşu içinde" },
  "تقوى": { meaning: "Takva - Allah'tan korkma", example: "Takva sahibi" },
  "توكل": { meaning: "Tevekkül - Allah'a güvenme", example: "Tevekkül etmek" },
  "استغفار": { meaning: "İstiğfar - Bağışlanma dileme", example: "İstiğfar etmek" },
  "توبة": { meaning: "Tevbe - Pişmanlık", example: "Tevbe etmek" },
  
  // Ek kelimeler
  "كتاب": { meaning: "Kitap", example: "Kur'an-ı Kerim" },
  "علم": { meaning: "İlim - Bilgi", example: "İlim tahsil etmek" },
  "قلب": { meaning: "Kalp - Gönül", example: "Kalben inanmak" },
  "نفس": { meaning: "Nefis - Ego", example: "Nefisle mücadele" },
  "روح": { meaning: "Ruh - Can", example: "Ruh âlemi" },
  "جنة": { meaning: "Cennet", example: "Cennet nimetleri" },
  "نار": { meaning: "Ateş, cehennem", example: "Cehennem azabı" },
  "ملك": { meaning: "Melek", example: "Melekler" },
  "شيطان": { meaning: "Şeytan", example: "Şeytandan Allah'a sığınırım" },
  "قيامة": { meaning: "Kıyamet", example: "Kıyamet günü" },
  "آخرة": { meaning: "Ahiret", example: "Ahiret hayatı" },
  "دنيا": { meaning: "Dünya", example: "Dünya hayatı" },
  "موت": { meaning: "Ölüm", example: "Ölümü hatırlamak" },
  "حياة": { meaning: "Hayat - Yaşam", example: "Hayat-ı ebediye" },
  
  // Sıfatlar
  "كريم": { meaning: "Kerim - Cömert, şerefli", example: "Allah'ın Kerim ismi" },
  "رحيم": { meaning: "Rahim - Merhametli", example: "Er-Rahim" },
  "عليم": { meaning: "Alim - Her şeyi bilen", example: "Allah Alim'dir" },
  "حكيم": { meaning: "Hakim - Hikmet sahibi", example: "El-Hakim" },
  "قدير": { meaning: "Kadir - Güç sahibi", example: "Kadir-i mutlak" },
  "عزيز": { meaning: "Aziz - Güçlü, değerli", example: "El-Aziz" },
  "جليل": { meaning: "Celil - Büyük, ulu", example: "Celle celalühü" },
  "جميل": { meaning: "Cemil - Güzel", example: "Cemal sıfatı" },
  
  // Fiiller ve edatlar
  "قال": { meaning: "Dedi, söyledi", example: "Allah buyurdu" },
  "كان": { meaning: "Oldu, idi", example: "Öyle idi" },
  "في": { meaning: "içinde, -de/-da", example: "Cennette" },
  "من": { meaning: "-den/-dan", example: "Allah'tan" },
  "إلى": { meaning: "-e/-a", example: "Allah'a" },
  "على": { meaning: "üzerine, üstünde", example: "Yer üzerinde" },
  "بـ": { meaning: "ile, vasıtasıyla", example: "Allah'ın izniyle" },
  "لـ": { meaning: "için", example: "Allah için" },
  "عن": { meaning: "hakkında, -den", example: "Ondan" },
  "مع": { meaning: "ile birlikte", example: "Allah ile" },
  
  // Çoğul ekler ve zamirler
  "هم": { meaning: "Onlar", example: "Onlar" },
  "نحن": { meaning: "Biz", example: "Bizler" },
  "أنت": { meaning: "Sen", example: "Sen" },
  "أنتم": { meaning: "Siz", example: "Sizler" },
  "هو": { meaning: "O", example: "O (erkek)" },
  "هي": { meaning: "O", example: "O (dişi)" },
  "ان": { meaning: "Muhakkak, gerçekten", example: "Kesinlikle" },
  "لا": { meaning: "Hayır, değil", example: "La ilahe illallah" },
  "ما": { meaning: "Ne, değil", example: "Ne var" },
  "إن": { meaning: "Eğer, muhakkak", example: "Şüphesiz" }
};

// Kitap kategorisini belirleme fonksiyonu
function determineCategoryFromPath(folderName) {
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
    'Tarihçe': 'Diğer',
    'Muhakemat': 'Diğer'
  };
  
  for (const [key, value] of Object.entries(categoryMap)) {
    if (folderName.includes(key)) {
      return value;
    }
  }
  
  return 'Diğer';
}

// Yayın yılını belirleme fonksiyonu
function determinePublishYear(title) {
  const yearMap = {
    'Sözler': 1926,
    'Mektubat': 1929,
    "Lem'alar": 1932,
    'Şualar': 1935,
    'Mesnevî': 1922,
    'İşarat': 1918,
    'Barla': 1935,
    'Kastamonu': 1940,
    'Emirdağ': 1945
  };
  
  for (const [key, year] of Object.entries(yearMap)) {
    if (title.includes(key)) {
      return year;
    }
  }
  
  return 1930;
}

// HTML içeriğini temizleme fonksiyonu
function cleanHtmlContent(html) {
  const $ = cheerio.load(html);
  
  // Gereksiz elementleri kaldır
  $('script, style, noscript, nav, header, footer').remove();
  
  // Başlıkları koru ama sadeleştir
  $('h1, h2, h3, h4, h5, h6').each((i, elem) => {
    const $elem = $(elem);
    const text = $elem.text().trim();
    if (text) {
      $elem.html(text);
    }
  });
  
  // Paragrafları temizle
  $('p').each((i, elem) => {
    const $elem = $(elem);
    const text = $elem.text().trim();
    if (!text) {
      $elem.remove();
    }
  });
  
  // HTML olarak geri dön (Osmanlıca karakterleri korumak için)
  return $.html();
}

// İçeriği sayfalara bölme fonksiyonu
function splitContentIntoPages(content, maxLength = 5000) {
  const $ = cheerio.load(content);
  const pages = [];
  let currentPage = '';
  let currentLength = 0;
  
  // Önce başlıkları belirle
  const elements = $('h1, h2, h3, h4, h5, h6, p').toArray();
  
  for (const elem of elements) {
    const $elem = $(elem);
    const elemHtml = $.html(elem);
    const elemLength = $elem.text().length;
    
    // Eğer tek bir element bile maksimum uzunluğu aşıyorsa, onu böl
    if (elemLength > maxLength) {
      if (currentPage) {
        pages.push(currentPage);
        currentPage = '';
        currentLength = 0;
      }
      
      // Uzun paragrafı cümlelere böl
      const text = $elem.text();
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      let tempPage = '';
      
      for (const sentence of sentences) {
        if (tempPage.length + sentence.length > maxLength && tempPage) {
          pages.push(`<p>${tempPage}</p>`);
          tempPage = sentence;
        } else {
          tempPage += sentence;
        }
      }
      
      if (tempPage) {
        pages.push(`<p>${tempPage}</p>`);
      }
    } else {
      // Normal durumda sayfa uzunluğunu kontrol et
      if (currentLength + elemLength > maxLength && currentPage) {
        pages.push(currentPage);
        currentPage = elemHtml;
        currentLength = elemLength;
      } else {
        currentPage += elemHtml;
        currentLength += elemLength;
      }
    }
  }
  
  // Son sayfayı ekle
  if (currentPage) {
    pages.push(currentPage);
  }
  
  return pages.length > 0 ? pages : [content];
}

// Osmanlıca kelimeleri tespit etme fonksiyonu
function extractOttomanWords(text) {
  // Osmanlıca/Arapça Unicode aralığı: U+0600 - U+06FF
  const ottomanWords = text.match(/[\u0600-\u06FF]+/g) || [];
  // Tekrarları kaldır ve 2 karakterden uzun kelimeleri al
  return [...new Set(ottomanWords.filter(word => word.length >= 2))];
}

// Ana import fonksiyonu
async function importRisaleNur(sourcePath, format = 'html') {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/risaleNurDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ MongoDB bağlantısı başarılı\n');
    
    // Önce mevcut sözlük kelimelerini ekle
    console.log('📚 Sözlük kelimeleri ekleniyor...');
    let dictionaryCount = 0;
    for (const [word, data] of Object.entries(ottomanDictionary)) {
      try {
        await Dictionary.findOneAndUpdate(
          { word },
          { 
            word,
            meaning: data.meaning,
            example: data.example
          },
          { upsert: true, new: true }
        );
        dictionaryCount++;
      } catch (error) {
        // Kelime zaten varsa devam et
      }
    }
    console.log(`✓ ${dictionaryCount} sözlük kelimesi eklendi/güncellendi\n`);
    
    // Format'a göre klasör seç
    const baseFolder = format === 'html' ? 
      path.join(sourcePath, 'html') : 
      path.join(sourcePath, 'txt');
    
    // Kitap klasörlerini oku
    const bookFolders = await fs.readdir(baseFolder);
    const sortedFolders = bookFolders.sort((a, b) => {
      const numA = parseInt(a.match(/^\d+/)?.[0] || '99');
      const numB = parseInt(b.match(/^\d+/)?.[0] || '99');
      return numA - numB;
    });
    
    console.log(`📖 ${sortedFolders.length} kitap klasörü bulundu\n`);
    
    // Her kitap klasörünü işle
    for (const bookFolder of sortedFolders) {
      const bookPath = path.join(baseFolder, bookFolder);
      const stat = await fs.stat(bookPath);
      
      if (!stat.isDirectory()) continue;
      
      console.log(`\n📘 ${bookFolder} işleniyor...`);
      
      // Kitap bilgilerini hazırla
      const bookOrder = parseInt(bookFolder.match(/^\d+/)?.[0] || '99');
      const bookTitle = bookFolder.replace(/^\d+\s*/, '').trim();
      const category = determineCategoryFromPath(bookFolder);
      const publishYear = determinePublishYear(bookTitle);
      
      // Mevcut kitabı kontrol et
      let book = await Book.findOne({ title: bookTitle });
      
      if (book) {
        console.log(`  ⚠️  Kitap zaten mevcut, sayfalar güncellenecek`);
        // Mevcut sayfaları temizle
        await Page.deleteMany({ bookId: book._id });
      } else {
        // Yeni kitap oluştur
        book = await Book.create({
          title: bookTitle,
          author: 'Bediüzzaman Said Nursi',
          coverImage: `/covers/${bookTitle.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')}.jpg`,
          category: category,
          description: `${bookTitle} - Risale-i Nur Külliyatı'nın önemli eserlerinden biridir.`,
          publishYear: publishYear,
          order: bookOrder,
          totalPages: 0
        });
        console.log(`  ✓ Kitap oluşturuldu`);
      }
      
      // Dosyaları oku
      const files = await fs.readdir(bookPath);
      const contentFiles = files
        .filter(f => f.endsWith(`.${format}`))
        .sort((a, b) => {
          const numA = parseFloat(a.match(/[\d.]+/)?.[0] || '0');
          const numB = parseFloat(b.match(/[\d.]+/)?.[0] || '0');
          return numA - numB;
        });
      
      console.log(`  📄 ${contentFiles.length} içerik dosyası bulundu`);
      
      // Tüm Osmanlıca kelimeleri toplamak için Set
      const allOttomanWords = new Set();
      let totalPageCount = 0;
      
      // Her dosyayı işle
      for (const file of contentFiles) {
        const filePath = path.join(bookPath, file);
        const fileContent = await fs.readFile(filePath, 'utf8');
        
        let content, chapter, subChapter;
        
        if (format === 'html') {
          // HTML içeriğini işle
          const $ = cheerio.load(fileContent);
          
          // Ana içeriği bul
          const $content = $('.entry-content').length ? $('.entry-content') : $('body');
          
          // Başlıkları al
          chapter = $content.find('h1').first().text().trim() || 
                   $content.find('h2').first().text().trim() || 
                   file.replace('.html', '').replace(/[\d.]+\s*/, '').trim();
          
          subChapter = $content.find('h3').first().text().trim() || '';
          
          // İçeriği temizle
          content = cleanHtmlContent($content.html() || fileContent);
        } else {
          // TXT içeriğini işle
          const lines = fileContent.split('\n');
          
          // İlk satırları başlık olarak al
          chapter = lines[0]?.trim() || file.replace('.txt', '').replace(/^.*-/, '').trim();
          
          // İçeriği HTML paragraflarına dönüştür
          content = lines
            .filter(line => line.trim())
            .map(line => `<p>${line.trim()}</p>`)
            .join('\n');
          
          subChapter = '';
        }
        
        // İçeriği sayfalara böl
        const pages = splitContentIntoPages(content);
        
        // Her sayfayı kaydet
        for (let i = 0; i < pages.length; i++) {
          totalPageCount++;
          const pageContent = pages[i];
          
          // Osmanlıca kelimeleri topla
          const ottomanWords = extractOttomanWords(pageContent);
          ottomanWords.forEach(word => allOttomanWords.add(word));
          
          // Sayfayı kaydet
          await Page.create({
            bookId: book._id,
            pageNumber: totalPageCount,
            content: pageContent,
            chapter: chapter,
            subChapter: i === 0 ? subChapter : '' // Alt başlık sadece ilk sayfada
          });
        }
        
        process.stdout.write(`\r  ✓ ${totalPageCount} sayfa işlendi...`);
      }
      
      console.log(`\n  ✓ Toplam ${totalPageCount} sayfa eklendi`);
      
      // Kitap sayfa sayısını güncelle
      book.totalPages = totalPageCount;
      await book.save();
      
      // Yeni Osmanlıca kelimeleri sözlüğe ekle
      let newWordsCount = 0;
      for (const word of allOttomanWords) {
        const exists = await Dictionary.findOne({ word });
        if (!exists && !ottomanDictionary[word]) {
          await Dictionary.create({
            word,
            meaning: 'Henüz anlamı eklenmemiş',
            example: ''
          });
          newWordsCount++;
        }
      }
      
      if (newWordsCount > 0) {
        console.log(`  ✓ ${newWordsCount} yeni Osmanlıca kelime sözlüğe eklendi`);
      }
    }
    
    // İstatistikleri göster
    const totalBooks = await Book.countDocuments();
    const totalPages = await Page.countDocuments();
    const totalWords = await Dictionary.countDocuments();
    
    console.log('\n\n✅ İçe aktarma tamamlandı!');
    console.log('📊 İstatistikler:');
    console.log(`   - Toplam kitap: ${totalBooks}`);
    console.log(`   - Toplam sayfa: ${totalPages}`);
    console.log(`   - Sözlük kelime sayısı: ${totalWords}`);
    
  } catch (error) {
    console.error('\n❌ Hata:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Veritabanı bağlantısı kapatıldı');
  }
}

// Komut satırı argümanlarını kontrol et
const args = process.argv.slice(2);
const sourcePath = args[0] || 'C:\\Users\\Fatih\\Desktop\\Risale-i-Nur-Diyanet';
const format = args[1] || 'html'; // 'html' veya 'txt'

if (!sourcePath) {
  console.log('Kullanım: node import-risale-nur.js <kaynak_dizin> [format]');
  console.log('Örnek: node import-risale-nur.js "C:\\Risale-i-Nur-Diyanet" html');
  console.log('Format: html (varsayılan) veya txt');
  process.exit(1);
}

console.log('🚀 Risale-i Nur İçe Aktarma Başlıyor...');
console.log(`📁 Kaynak dizin: ${sourcePath}`);
console.log(`📄 Format: ${format}\n`);

importRisaleNur(sourcePath, format);