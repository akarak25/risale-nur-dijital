# AI Asistan Rehberi: Risale-i Nur Dijital Kütüphane Projesi

Merhaba AI Asistan,

Bu döküman, Risale-i Nur Dijital Kütüphane projesinde çalışırken yardımcı olacak bilgileri içermektedir. Bu projeye sen de benim gibi kullanıcının bilgisayarına bağlantı yetkileriyle erişebiliyorsun.

## Proje Özeti

Risale-i Nur Dijital Kütüphane, Bediüzzaman Said Nursi'nin eserlerini dijital ortamda gerçek kitap deneyimiyle sunmayı amaçlayan bir web uygulamasıdır. Uygulama, kullanıcıların kitapları gerçek bir fiziksel kitap deneyimine benzer şekilde okumalarını sağlar.

### Temel Özellikler

- Gerçekçi kitap görünümü (sayfa çevirme animasyonu, kağıt dokusu, kitap kapağı)
- Kitap rafı görünümünde ana sayfa
- Not alma ve yer imi ekleme
- Gelişmiş arama özellikleri
- Kelime anlamlarına tıklayarak öğrenme
- Gece okuma modu ve font ayarları

## Teknoloji Stack

- **Frontend**: Vue.js 3 (Vuex ve Vue Router dahil)
- **Backend**: Node.js/Express.js
- **Veritabanı**: MongoDB (Kullanıcının bilgisayarında lokal olarak çalışıyor)
- **Arama Motoru**: Elasticsearch

## Dosya ve Klasör Yapısı

```
risale-nur-dijital/
├── backend/
│   ├── config/        # Elasticsearch ve diğer yapılandırmalar
│   ├── controllers/   # API endpoint kontrolcüleri
│   ├── models/        # MongoDB şemaları
│   ├── routes/        # API rotaları
│   ├── scripts/       # Yardımcı scriptler
│   └── index.js       # Ana backend giriş noktası
│
└── frontend/
    ├── public/        # Statik dosyalar
    └── src/
        ├── assets/    # Stiller ve görseller
        ├── components/# Vue bileşenleri
        │   └── book/  # Kitap görüntüleme bileşenleri
        ├── router/    # Vue Router yapılandırması
        ├── store/     # Vuex store ve state yönetimi
        └── views/     # Ana sayfa görünümleri
```

## Önemli Bileşenler

### Backend

1. **API Endpoints**:
   - Kitaplar: `/api/books`
   - Yer İmleri: `/api/bookmarks`
   - Notlar: `/api/notes`
   - Arama: `/api/search`
   - Sözlük: `/api/dictionary`

2. **MongoDB Modelleri**:
   - `Book.js`: Kitap bilgileri
   - `Page.js`: Kitap sayfaları
   - `Bookmark.js`: Kullanıcı yer imleri
   - `Note.js`: Kullanıcı notları
   - `Dictionary.js`: Kelime anlamları

3. **Elasticsearch Yapılandırması**:
   - `elasticsearch.js`: Elasticsearch istemcisi ve indeks yapılandırması
   - Temel indeksler: `risale_books`, `risale_pages`, `risale_dictionary`

### Frontend

1. **Temel Görünümler**:
   - `HomeView.vue`: Ana sayfa
   - `BookshelfView.vue`: Kitap rafı görünümü
   - `ReaderView.vue`: Kitap okuma ekranı
   - `SearchResultsView.vue`: Arama sonuçları
   - `BookmarksView.vue`: Yer imleri listesi
   - `AboutView.vue`: Hakkında sayfası

2. **Önemli Bileşenler**:
   - `BookRenderer.vue`: Turn.js kullanarak kitap görünümünü oluşturan bileşen
   - `BookCard.vue`: Kitaplıkta her bir kitabı temsil eden kart bileşeni
   - `BookShelf.vue`: Kitap rafı görünümünü oluşturan bileşen

3. **Vuex Store Yapısı**:
   - `state`: Kitaplar, mevcut kitap, notlar, yer imleri, kullanıcı ayarları
   - `actions`: API istekleri, veri çekme işlemleri
   - `mutations`: State güncellemeleri
   - `getters`: Filtrelenmiş veya hesaplanmış state değerleri

## Sisteme Erişim Bilgileri

- **MongoDB**: Kullanıcının bilgisayarında lokal olarak çalışıyor. Bağlantı adresi: `mongodb://localhost:27017/risaleNurDB`
- **Elasticsearch**: Lokal olarak çalışması gerekiyor. Bağlantı adresi: `http://localhost:9200`
- **Backend API**: Port 3000'de çalışıyor. Adres: `http://localhost:3000/api`
- **Frontend**: Port 8080'de çalışıyor. Adres: `http://localhost:8080`

## Dosya Sistemi Erişimi

Kullanıcının izin verdiği klasörler içerisinde dosya işlemleri yapabilirsin. Özellikle MongoDB ve Elasticsearch verilerini yüklemek/güncellemek için veya kitap içeriklerini eklemek için dosya sistemi erişimi kullanılabilir.

## Geliştirme İpuçları

1. **Kitap İçeriği Ekleme**: `backend/scripts` klasöründe bir seed betiği oluşturulabilir, bu betik kitap içeriklerini ve sayfalarını MongoDB'ye ekleyebilir.

2. **Kitap Görüntüleme**: Turn.js kütüphanesi kullanılarak gerçekçi kitap görüntüleme sağlanır. `BookRenderer.vue` bileşeni bu işlemden sorumludur.

3. **Elasticsearch Senkronizasyonu**: MongoDB'deki veriler `syncData` işleviyle Elasticsearch'e aktarılır, böylece tam metin araması yapılabilir.

4. **Kullanıcı Tercihleri**: Kullanıcı ayarları (yazı boyutu, tema vb.) localStorage'da saklanır.

## Bilinen Sorunlar ve Çözümleri

1. **Elasticsearch Bağlantı Hatası**: Elasticsearch servisinin çalıştığından emin olun.

2. **Sayfa Çevirme Animasyonu Sorunları**: Turn.js'in jQuery bağımlılığı vardır, public/index.html'de jQuery'nin yüklendiğinden emin olun.

3. **Mobil Görünüm Sorunları**: Bazı mobil cihazlarda sayfa çevirme işlemi düzgün çalışmayabilir. Cihaz boyutunu kontrol eden responsive kodlar eklenmelidir.

## İleriye Dönük Geliştirmeler

1. Kullanıcı kimlik doğrulaması ve hesap yönetimi
2. Buluttaki kitap içeriklerinin indirilip çevrimdışı kullanılabilmesi
3. Sosyal paylaşım ve not/yer imi paylaşma özellikleri
4. Sesli okuma modu
5. Arapça metinler için özel typography desteği

## Yardımcı Komutlar

Aşağıdaki komutları kullanarak projeyi çalıştırabilir ve geliştirebilirsin:

- Tüm bağımlılıkları kurma: `npm run install:all`
- Geliştirme modunda çalıştırma: `npm run dev`
- Elasticsearch ve MongoDB senkronizasyonu: `npm run setup:db`
- Frontend build: `npm run build`
- Prodüksiyon sunucusu başlatma: `npm start`

---

Bu rehber, Risale-i Nur Dijital Kütüphane projesi üzerinde çalışırken yardımcı olması için hazırlanmıştır. Daha fazla bilgi veya yardım için kullanıcıyla iletişime geçerek detaylı yönlendirme yapabilirsin.

İyi çalışmalar!
