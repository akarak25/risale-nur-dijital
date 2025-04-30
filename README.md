# Risale-i Nur Dijital Kütüphane

Risale-i Nur Külliyatını gerçek bir kitap okuma deneyimiyle dijital ortamda sunan, modern web teknolojileri ile geliştirilmiş bir uygulama.

## Proje Açıklaması

Risale-i Nur Dijital Kütüphane, Bediüzzaman Said Nursi'nin Risale-i Nur Külliyatını dijital ortamda gerçek kitap okuma deneyimiyle sunmayı amaçlayan bir projedir. Kullanıcılar, sayfaları fiziksel bir kitap gibi çevirebilir, not alabilir, yer imi ekleyebilir ve külliyat içerisinde arama yapabilirler.

### Özellikler

- **Gerçekçi Kitap Görünümü**: Sayfa çevirme animasyonu, kağıt dokusu ve kitap kapağı
- **Kitap Rafı Ana Sayfa**: Külliyatın kitaplarını kategoriler halinde sunan görsel bir kitaplık
- **Kolay Gezinme**: İçindekiler tablosu, sayfa numarası ve bölümler arası geçiş
- **Not Alma**: Sayfa kenarlarına notlar ekleyebilme
- **Yer İmleri**: Önemli sayfalara yer imi koyabilme
- **Gece Okuma Modu**: Gözü yormayan karanlık tema
- **Özelleştirilebilir Görünüm**: Yazı boyutu, yazı tipi ve satır aralığı ayarları
- **Kelime Anlamları**: Metin içindeki kelimelerin anlamlarını görebilme
- **Tam Ekran Modu**: Dikkat dağıtıcı unsurları kaldıran odaklanmış okuma deneyimi
- **Mobil Uyumluluk**: Tüm cihazlarda sorunsuz çalışan responsive tasarım
- **Gelişmiş Arama**: Külliyat içerisinde hızlı ve kapsamlı arama yapabilme

## Teknoloji Stack

- **Frontend**: Vue.js 3
- **Backend**: Node.js / Express.js
- **Veritabanı**: MongoDB
- **Arama Motoru**: Elasticsearch

## Kurulum

### Gereksinimler

- Node.js (v14+)
- MongoDB (v4+)
- Elasticsearch (v7+)

### Kurulum Adımları

1. Repoyu klonlayın:
   ```
   git clone https://github.com/kullaniciadi/risale-nur-dijital.git
   cd risale-nur-dijital
   ```

2. Backend bağımlılıklarını kurun:
   ```
   cd backend
   npm install
   ```

3. Frontend bağımlılıklarını kurun:
   ```
   cd ../frontend
   npm install
   ```

4. `.env` dosyasını oluşturun (backend klasöründe):
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/risaleNurDB
   ES_HOST=http://localhost:9200
   NODE_ENV=development
   ```

5. MongoDB'yi başlatın:
   ```
   mongod
   ```

6. Elasticsearch'ü başlatın:
   ```
   elasticsearch
   ```

7. Veritabanını ve Elasticsearch indekslerini oluşturun:
   ```
   cd backend
   node scripts/sync-elasticsearch.js
   ```

8. Backend sunucusunu başlatın:
   ```
   npm run dev
   ```

9. Frontend geliştirme sunucusunu başlatın:
   ```
   cd ../frontend
   npm run serve
   ```

10. Tarayıcıda uygulamayı açın: `http://localhost:8080`

## İçerik Ekleme

İçerik ekleme işlemi için MongoDB'ye kitap ve sayfa verilerinin eklenmesi gerekir. Bunu aşağıdaki adımlarla yapabilirsiniz:

1. `backend/data` klasöründeki örnek verileri kullanarak içerik ekleyin:
   ```
   cd backend
   node scripts/seed-data.js
   ```

2. Veya MongoDB Compass gibi bir araç kullanarak JSON formatında verileri içe aktarabilirsiniz.

## Geliştirme

### Klasör Yapısı

```
risale-nur-dijital/
├── backend/
│   ├── config/        # Elasticsearch ve diğer konfigürasyonlar
│   ├── controllers/   # API endpoint kontrolcüleri
│   ├── models/        # Mongoose modelleri
│   ├── routes/        # API route tanımları
│   ├── scripts/       # Yardımcı scriptler
│   └── index.js       # Ana uygulama dosyası
│
└── frontend/
    ├── public/        # Statik dosyalar
    └── src/
        ├── assets/    # Resimler, stiller
        ├── components/# Vue bileşenleri
        ├── router/    # Vue Router konfigürasyonu
        ├── store/     # Vuex store
        └── views/     # Sayfa görünümleri
```

### API Endpointleri

#### Kitaplar
- `GET /api/books` - Tüm kitapları getir
- `GET /api/books/category/:category` - Kategoriye göre kitapları getir
- `GET /api/books/:id` - Belirli bir kitabı getir
- `GET /api/books/:bookId/page/:pageNumber` - Kitap sayfasını getir
- `GET /api/books/:bookId/contents` - Kitap içindekiler tablosunu getir

#### Yer İmleri
- `GET /api/bookmarks/user/:userId` - Kullanıcının tüm yer imlerini getir
- `GET /api/bookmarks/user/:userId/book/:bookId` - Kitaptaki yer imlerini getir
- `POST /api/bookmarks` - Yeni yer imi ekle
- `PUT /api/bookmarks/:id` - Yer imi güncelle
- `DELETE /api/bookmarks/:id` - Yer imi sil

#### Notlar
- `GET /api/notes/user/:userId` - Kullanıcının tüm notlarını getir
- `GET /api/notes/user/:userId/book/:bookId` - Kitaptaki notları getir
- `GET /api/notes/user/:userId/book/:bookId/page/:pageNumber` - Sayfadaki notları getir
- `POST /api/notes` - Yeni not ekle
- `PUT /api/notes/:id` - Not güncelle
- `DELETE /api/notes/:id` - Not sil

#### Arama
- `GET /api/search/basic?query=...` - Basit metin araması
- `GET /api/search/advanced?query=...&bookId=...&category=...&exactPhrase=...` - Gelişmiş arama
- `GET /api/search/word/:word` - Kelime anlamı ara

#### Sözlük
- `GET /api/dictionary` - Tüm sözlük kelimelerini getir
- `GET /api/dictionary/word/:word` - Belirli bir kelimeyi getir
- `GET /api/dictionary/search?prefix=...` - Benzer kelimeleri ara

## Canlı Demo

[https://risale-nur-dijital.example.com](https://risale-nur-dijital.example.com)

## Katkıda Bulunma

1. Bu repo'yu fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'ınıza push edin (`git push origin feature/amazing-feature`)
5. Pull request oluşturun

## Lisans

Bu proje [MIT lisansı](LICENSE) altında lisanslanmıştır.

## İletişim

Proje Yöneticisi - [ornek@email.com](mailto:ornek@email.com)

Proje Link: [https://github.com/kullaniciadi/risale-nur-dijital](https://github.com/kullaniciadi/risale-nur-dijital)