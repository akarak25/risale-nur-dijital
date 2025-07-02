# Risale-i Nur Dijital Kütüphane - Kitap İçe Aktarma Sistemi

Bu sistem, Risale-i Nur kitaplarını otomatik olarak dijital kütüphaneye aktarmanızı sağlar.

## 🚀 Hızlı Başlangıç

### 1. Test Verisi Ekleme (Önerilen)
Sistemi test etmek için örnek kitap ekleyin:

```bash
cd backend/scripts
node quick-import.js
```

Bu komut:
- 1 adet örnek kitap (Sözler)
- 3 adet sayfa
- 4 adet Osmanlıca sözlük kelimesi ekler

### 2. Diyanet Klasöründen Toplu İçe Aktarma

#### A. Komut Satırından:
```bash
cd backend/scripts
node import-risale-nur.js "C:\Users\Fatih\Desktop\Risale-i-Nur-Diyanet" html
```

#### B. Admin Panelden:
1. Admin olarak giriş yapın
2. "Kitap Yönetimi" sayfasına gidin
3. "Toplu İçe Aktar" butonuna tıklayın
4. "Diyanet Klasöründen" seçeneğini seçin
5. Dosya formatını seçin (HTML veya TXT)
6. "İçe Aktarmayı Başlat" butonuna tıklayın

## 📁 Desteklenen Formatlar

### HTML Formatı
- Diyanet'in HTML dosyaları otomatik olarak işlenir
- Başlıklar ve alt başlıklar korunur
- Osmanlıca metinler düzgün şekilde saklanır

### TXT Formatı
- Düz metin dosyaları desteklenir
- İlk satır başlık olarak alınır
- Her satır bir paragraf olarak işlenir

## 🔤 Osmanlıca Sözlük

Sistem otomatik olarak:
- Osmanlıca kelimeleri tespit eder
- Sözlüğe ekler
- Okuyucuya kelime üzerine gelince anlamını gösterir

### Sözlük Kelimesi Ekleme
```javascript
// backend/scripts/import-risale-nur.js dosyasındaki ottomanDictionary objesine ekleyin:
"kelime": { meaning: "anlam", example: "örnek kullanım" }
```

## 🛠️ Kurulum

### Backend Bağımlılıkları
```bash
cd backend
npm install
```

### Gerekli Paketler
- mongoose
- cheerio (HTML parse için)
- ws (WebSocket için)
- uuid

## 📊 İçe Aktarma Özellikleri

1. **Otomatik Kategori Belirleme**: Klasör isimlerinden kitap kategorilerini belirler
2. **Sayfa Bölme**: Uzun içerikleri otomatik olarak sayfalara böler
3. **İlerleme Takibi**: WebSocket ile gerçek zamanlı ilerleme gösterimi
4. **Hata Yönetimi**: Başarısız işlemleri loglar ve devam eder
5. **Osmanlıca Desteği**: Unicode karakterleri korur ve sözlük oluşturur

## 🔍 Sorun Giderme

### MongoDB Bağlantı Hatası
```bash
# .env dosyasını kontrol edin
MONGODB_URI=mongodb://localhost:27017/risaleNurDB
```

### İçe Aktarma Başlamıyor
1. Kaynak dizinin var olduğundan emin olun
2. HTML veya TXT klasörlerinin mevcut olduğunu kontrol edin
3. Backend loglarını inceleyin

### Osmanlıca Karakterler Görünmüyor
- UTF-8 encoding kullanıldığından emin olun
- Frontend'de uygun font yüklendiğini kontrol edin

## 📝 Notlar

- İçe aktarma işlemi kitap sayısına göre 5-30 dakika sürebilir
- Mevcut kitaplar güncellenirken eski sayfalar silinir
- Sözlük kelimeleri tekrar eklenmez (mevcut olanlar korunur)
- Admin yetkisi gerektirir

## 🤝 Destek

Sorunlar için:
1. Backend loglarını kontrol edin
2. Browser konsolunda hata mesajlarını inceleyin
3. MongoDB bağlantısını doğrulayın