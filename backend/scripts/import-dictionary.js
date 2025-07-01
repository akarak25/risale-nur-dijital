require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const fs = require('fs').promises;
const Dictionary = require('../models/Dictionary');

// CSV veya JSON formatında sözlük verilerini içe aktar
async function importDictionary(filePath) {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/risaleNurDB');
    console.log('MongoDB bağlantısı başarılı');
    
    // Dosya içeriğini oku
    const content = await fs.readFile(filePath, 'utf8');
    let words = [];
    
    // Dosya uzantısına göre parse et
    if (filePath.endsWith('.json')) {
      words = JSON.parse(content);
    } else if (filePath.endsWith('.csv')) {
      // CSV formatı: kelime,anlam,örnek
      const lines = content.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const word = {
          word: values[0],
          meaning: values[1],
          example: values[2] || ''
        };
        words.push(word);
      }
    }
    
    console.log(`${words.length} kelime bulundu`);
    
    // Kelimeleri veritabanına ekle
    let addedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const wordData of words) {
      try {
        // Kelime zaten var mı kontrol et
        const existing = await Dictionary.findOne({ 
          word: { $regex: new RegExp('^' + wordData.word + '$', 'i') }
        });
        
        if (existing) {
          // Varsa güncelle
          existing.meaning = wordData.meaning;
          existing.example = wordData.example || existing.example;
          await existing.save();
          updatedCount++;
          console.log(`Güncellendi: ${wordData.word}`);
        } else {
          // Yoksa yeni ekle
          await Dictionary.create({
            word: wordData.word,
            meaning: wordData.meaning,
            example: wordData.example || ''
          });
          addedCount++;
          console.log(`Eklendi: ${wordData.word}`);
        }
      } catch (error) {
        console.error(`Hata (${wordData.word}):`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n--- ÖZET ---');
    console.log(`Yeni eklenen: ${addedCount}`);
    console.log(`Güncellenen: ${updatedCount}`);
    console.log(`Hatalı: ${errorCount}`);
    console.log(`Toplam işlenen: ${addedCount + updatedCount}`);
    
  } catch (error) {
    console.error('Sözlük içe aktarma hatası:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB bağlantısı kapatıldı');
  }
}

// Örnek Osmanlıca sözlük verisi oluştur
async function createSampleDictionary() {
  const sampleWords = [
    {
      word: "حقيقت",
      meaning: "Hakikat - Gerçek, doğru, asıl olan",
      example: "Risale-i Nur'da hakikat ilimleri açıklanır"
    },
    {
      word: "توحيد",
      meaning: "Tevhid - Allah'ın birliği, tek olması",
      example: "Tevhid inancı İslam'ın temelidir"
    },
    {
      word: "عالم",
      meaning: "Âlem - Dünya, kâinat, evren",
      example: "Bu âlemdeki her şey Allah'ı gösterir"
    },
    {
      word: "معنى",
      meaning: "Mana - Anlam, mefhum",
      example: "Her ayetin derin manaları vardır"
    },
    {
      word: "نور",
      meaning: "Nur - Işık, aydınlık",
      example: "İman nuru kalpleri aydınlatır"
    },
    {
      word: "رسالة",
      meaning: "Risale - Mektup, yazılı eser",
      example: "Risale-i Nur Külliyatı"
    },
    {
      word: "كلمة",
      meaning: "Kelime - Söz",
      example: "Kur'an'ın her kelimesi mucizedir"
    },
    {
      word: "ايمان",
      meaning: "İman - İnanç, itikat",
      example: "İman hakikatleri"
    },
    {
      word: "قرآن",
      meaning: "Kur'an - Kur'an-ı Kerim",
      example: "Kur'an, hidayet rehberidir"
    },
    {
      word: "حكمة",
      meaning: "Hikmet - Bilgelik, Allah'ın her işindeki gizli sebep",
      example: "Her olayda ilahi hikmetler vardır"
    },
    {
      word: "عبادة",
      meaning: "İbadet - Kulluk, tapınma",
      example: "İbadet, kulluğun özüdür"
    },
    {
      word: "معرفة",
      meaning: "Marifet - Tanıma, bilme, irfan",
      example: "Allah'ı tanıma marifeti"
    },
    {
      word: "تفسير",
      meaning: "Tefsir - Açıklama, yorum",
      example: "Kur'an tefsiri"
    },
    {
      word: "سنة",
      meaning: "Sünnet - Hz. Peygamber'in yolu",
      example: "Sünnet-i seniyyeye uymak"
    },
    {
      word: "شريعة",
      meaning: "Şeriat - İslam hukuku, ilahi kanun",
      example: "Şeriat ahkâmı"
    }
  ];
  
  // Sample dictionary JSON dosyası oluştur
  await fs.writeFile(
    'sample-ottoman-dictionary.json',
    JSON.stringify(sampleWords, null, 2),
    'utf8'
  );
  
  console.log('Örnek sözlük dosyası oluşturuldu: sample-ottoman-dictionary.json');
}

// Kullanım
const filePath = process.argv[2];

if (!filePath) {
  console.log('\nKullanım: node import-dictionary.js <sözlük_dosyası>');
  console.log('Örnek: node import-dictionary.js ottoman-dictionary.json');
  console.log('       node import-dictionary.js sozluk.csv\n');
  console.log('CSV Formatı: kelime,anlam,örnek');
  console.log('\nÖrnek sözlük oluşturmak için: node import-dictionary.js --create-sample');
  process.exit(1);
}

if (filePath === '--create-sample') {
  createSampleDictionary();
} else {
  importDictionary(filePath);
}