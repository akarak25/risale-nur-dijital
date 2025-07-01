# Risale-i Nur Dijital Kütüphane - Kitap Ekleme Rehberi

## 📚 Kitap Ekleme Yöntemleri

### 1. Toplu Kitap Ekleme (Önerilen)

#### Klasör Yapısı
Kitaplarınızı aşağıdaki klasör yapısında organize edin:
```
kitaplar/
├── sozler/
│   ├── metadata.json
│   ├── sayfa-001.txt
│   ├── sayfa-002.txt
│   └── ...
├── mektubat/
│   ├── metadata.json
│   ├── sayfa-001.txt
│   └── ...
└── lemalar/
    ├── metadata.json
    └── ...
```

#### metadata.json Örneği
```json
{
  "title": "Sözler",
  "author": "Bediüzzaman Said Nursi",
  "category": "Sözler",
  "description": "Risale-i Nur Külliyatı'nın ilk eseri olan Sözler...",
  "coverImage": "/covers/sozler.jpg",
  "publishYear": 1926,
  "order": 1
}
```

#### Toplu Ekleme Komutu
```bash
cd backend/scripts
node import-books.js C:/kitaplar
```

### 2. API ile Tek Tek Ekleme

#### Yeni Kitap Ekle
```bash
curl -X POST http://localhost:3001/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Şualar",
    "coverImage": "/covers/sualar.jpg",
    "totalPages": 600,
    "category": "Şualar",
    "description": "Şualar kitabının açıklaması",
    "publishYear": 1935,
    "order": 4
  }'
```

#### Kitaba Sayfa Ekle
```bash
curl -X POST http://localhost:3001/api/books/page \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "kitap_id_buraya",
    "pageNumber": 1,
    "content": "Bismillahirrahmanirrahim...",
    "chapter": "Birinci Şua",
    "subChapter": "Giriş"
  }'
```

## 🔤 Sözlük Kelimesi Ekleme

### 1. Toplu Sözlük Ekleme

#### JSON Formatında
```json
[
  {
    "word": "حقيقت",
    "meaning": "Hakikat - Gerçek, doğru",
    "example": "Hakikat-i imaniye"
  },
  {
    "word": "نور",
    "meaning": "Nur - Işık, aydınlık",
    "example": "Nur-u iman"
  }
]
```

```bash
cd backend/scripts
node import-dictionary.js sozluk.json
```

#### CSV Formatında
```csv
kelime,anlam,örnek
حقيقت,Hakikat - Gerçek,Hakikat-i imaniye
نور,Nur - Işık,Nur-u iman
```

```bash
node import-dictionary.js sozluk.csv
```

### 2. Örnek Sözlük Oluştur
```bash
node import-dictionary.js --create-sample
```

## 🎯 Özellikler

### Osmanlıca Kelime Tooltip'leri
- Sayfalardaki Osmanlıca kelimeler otomatik tespit edilir
- Üzerine gelindiğinde Türkçe anlamı görünür
- Kelime anlamları cache'lenir (hızlı erişim)

### Kitap İçeriği Formatlama
- Osmanlıca karakterler otomatik normalize edilir
- Bölüm ve alt bölüm bilgileri desteklenir
- Sayfa numaraları otomatik sıralanır

## 📁 Kitap Dosya Formatları

### Düz Metin (.txt)
```
Bismillahirrahmanirrahim

Bu birinci sayfanın içeriğidir.
حقيقت kelimesi üzerine geldiğinizde anlamı görünecek.
```

### JSON Format (.json)
```json
{
  "pageNumber": 1,
  "content": "Sayfa içeriği...",
  "chapter": "Birinci Söz",
  "subChapter": "Bismillah"
}
```

## 🚀 Hızlı Başlangıç

1. **Veritabanını Hazırla**
   ```bash
   npm run seed   # Örnek veri ekle
   npm run index  # Index'leri oluştur
   ```

2. **Uygulamayı Başlat**
   ```bash
   npm run dev    # Backend + Frontend
   ```

3. **Kitap Ekle**
   ```bash
   cd backend/scripts
   node import-books.js C:/risale-nur-kitaplar
   ```

4. **Sözlük Ekle**
   ```bash
   node import-dictionary.js ottoman-sozluk.json
   ```

## 📝 Notlar

- Kitap kapak görselleri `/frontend/public/covers/` klasörüne eklenmeli
- Osmanlıca Unicode aralığı: U+0600 - U+06FF
- Her kitap için benzersiz bir klasör adı kullanın
- Sayfa dosyaları sayfa numarasına göre isimlendirilmeli

## 🔧 Sorun Giderme

**Osmanlıca karakterler görünmüyor:**
- Font desteğini kontrol edin (Noto Naskh Arabic önerilir)
- Unicode karakterlerin doğru kaydedildiğinden emin olun

**Sözlük anlamları görünmüyor:**
- Dictionary API'nin çalıştığını kontrol edin
- Browser console'da hata mesajlarını kontrol edin
- Cache'i temizleyin

**Kitap sayfaları yüklenmiyor:**
- MongoDB bağlantısını kontrol edin
- Sayfa numaralarının ardışık olduğundan emin olun
- Backend loglarını kontrol edin