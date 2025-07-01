# Risale-i Nur Dijital Kütüphane - Admin Panel ve Otomatik İçerik Aktarma

## 🚀 Hızlı Kurulum

### 1. Bağımlılıkları Yükleyin
```bash
# Ana dizinde
npm install

# Backend bağımlılıkları (cheerio dahil)
cd backend
npm install
```

### 2. Admin Kullanıcısı Oluşturun
```bash
cd backend/scripts
node create-admin.js

# Veya özel email/şifre ile:
node create-admin.js "fatih@example.com" "güçlüşifre123"
```

### 3. Uygulamayı Başlatın
```bash
# Ana dizinde
npm run dev
```

### 4. Admin Paneline Giriş
1. http://localhost:8081/login adresine gidin
2. Admin bilgileriyle giriş yapın
3. http://localhost:8081/admin sayfasına gidin

## 📚 Diyanet Verilerini İçe Aktarma

### Admin Panel Üzerinden
1. Admin panele giriş yapın
2. "İçerik Aktarma" bölümünde "Diyanet Verilerini Aktar" butonuna tıklayın
3. Format seçin (HTML önerilir)
4. İstediğiniz kitapları seçin
5. "Aktarmayı Başlat" butonuna tıklayın

### Terminal Üzerinden (Tüm Kitaplar)
```bash
cd backend/scripts
node import-diyanet.js "C:\Users\Fatih\Desktop\Risale-i-Nur-Diyanet"
```

## 🔤 Sözlük Yönetimi

### Admin Panel Üzerinden
1. Admin panelde "Sözlük Yönetimi" bölümüne gidin
2. "Sözlük İçe Aktar" butonuna tıklayın
3. JSON formatında kelime listesi yapıştırın veya dosya seçin

### Örnek Sözlük Formatı
```json
[
  {
    "word": "حقيقت",
    "meaning": "Hakikat - Gerçek, doğru",
    "example": "Hakikat-i imaniye"
  },
  {
    "word": "توحيد",
    "meaning": "Tevhid - Allah'ın birliği",
    "example": "Tevhid inancı"
  }
]
```

## ✨ Yeni Özellikler

### 1. Admin Dashboard
- Toplam kitap, sayfa, kelime ve kullanıcı istatistikleri
- Hızlı işlem butonları
- Görsel arayüz

### 2. Otomatik İçerik Aktarma
- Diyanet HTML/TXT formatlarını destekler
- Toplu kitap ekleme
- Osmanlıca kelimeleri otomatik tespit ve sözlüğe ekleme
- İlerleme çubuğu ile takip

### 3. Gelişmiş Sözlük Sistemi
- 40+ temel Osmanlıca kelime hazır
- JSON/CSV formatında toplu ekleme
- Kelime üzerine gelince anlam gösterme

### 4. Kitap Yönetimi
- Admin panelden kitap ekleme/düzenleme
- Sayfa yönetimi
- Kategori düzenleme

## 🛠️ Teknik Detaylar

### Veritabanı Yapısı
- **users**: role alanı ile admin kontrolü
- **books**: Kitap bilgileri ve metadatası
- **pages**: Her kitabın sayfaları
- **dictionaries**: Osmanlıca-Türkçe sözlük

### API Endpoints
- `POST /api/admin/import/diyanet` - Diyanet verilerini içe aktar
- `POST /api/admin/import/bulk` - Klasörden toplu kitap ekle
- `POST /api/admin/dictionary/import` - Sözlük kelimelerini içe aktar
- `GET /api/admin/stats` - İstatistikleri getir

### Frontend Bileşenleri
- `AdminDashboard.vue` - Ana admin paneli
- `DictionaryTooltip.vue` - Kelime anlamı gösterme
- `dictionaryMixin.js` - Osmanlıca kelime tespit

## 📝 Notlar

### Güvenlik
- Admin paneline sadece `role: 'admin'` olan kullanıcılar erişebilir
- JWT token ile koruma
- Route guard'lar ile yetki kontrolü

### Performans
- Sözlük kelimeleri client-side cache'lenir
- Sayfalama ile büyük içerikler yönetilir
- Lazy loading ile hızlı yükleme

### Özelleştirme
- Kelime tooltip stilleri özelleştirilebilir
- Admin panel tema desteği
- Responsive tasarım

## 🐛 Sorun Giderme

**Admin panele erişemiyorum:**
- Kullanıcının role alanının 'admin' olduğundan emin olun
- create-admin.js scriptini çalıştırın

**Kitaplar içe aktarılmıyor:**
- MongoDB'nin çalıştığından emin olun
- Kaynak dizin yolunun doğru olduğunu kontrol edin
- Backend loglarını inceleyin

**Sözlük çalışmıyor:**
- Dictionary API endpoint'inin çalıştığını kontrol edin
- Browser console'da hata mesajlarını kontrol edin

## 🎯 Gelecek Özellikler
- [ ] Kullanıcı yönetimi sayfası
- [ ] Kitap içeriği düzenleme editörü
- [ ] Toplu sözlük düzenleme
- [ ] İstatistik grafikleri
- [ ] Yedekleme ve geri yükleme