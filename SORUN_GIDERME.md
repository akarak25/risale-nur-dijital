# Risale-i Nur Dijital Kütüphane - Sorun Giderme ve Kullanım

## ✅ Yapılan Düzeltmeler

### 1. **Model Hataları Düzeltildi**
- Book modelindeki `category` enum'una "Risale-i Nur" eklendi
- `order` alanına varsayılan değer (999) eklendi

### 2. **WebSocket Bağlantısı Düzeltildi**
- Port otomatik algılama eklendi
- Doğru WebSocket URL yapılandırması

### 3. **Tekli Kitap Ekleme Sayfası Eklendi** 🎉
- **Özellikler:**
  - Dosyadan yükleme (TXT, HTML, DOC, DOCX)
  - Metin yapıştırma
  - Bölüm bölüm ekleme
  - Otomatik sıralama
  - Osmanlıca kelime tespiti
  - İçerik önizleme
  - Otomatik sayfa bölme

## 📚 Kitap Ekleme Yöntemleri

### 1. **Hızlı Test İçeriği**
```bash
cd backend/scripts
node quick-import.js
```

### 2. **Toplu İçe Aktarma**
- Admin Panel → Toplu Kitap İçe Aktar
- Diyanet klasöründen otomatik import
- HTML/TXT format desteği

### 3. **Tekli Kitap Ekleme** (YENİ!)
- Admin Panel → Tekli Kitap Ekle
- Dosya sürükle-bırak
- Otomatik içerik işleme
- Akıllı sıralama sistemi

### 4. **Hızlı Kitap Ekleme**
- Admin Panel → Kitaplar → Hızlı Ekle
- Sadece kitap bilgileri için

## 🎯 Otomatik Sıralama Sistemi

Tekli kitap ekleme sayfası şu özellikleri sunar:
- Aynı kategorideki en yüksek sıra numarasını bulur
- Otomatik olarak sonraki numarayı atar
- Manuel sıra belirtme imkanı
- Kitaplar her zaman doğru sırada görünür

## 🔤 Osmanlıca Kelime Desteği

- Otomatik Unicode kelime tespiti
- Hover'da anlam gösterimi
- Toplu sözlük kelimesi ekleme
- 90+ hazır Osmanlıca kelime

## 🛠️ Sorun Yaşarsanız

### Port Hatası
Backend varsayılan olarak 3000 portunu kullanır. Eğer farklı port kullanıyorsanız:
```bash
# .env dosyasında
PORT=3001
```

### MongoDB Bağlantı Hatası
```bash
# .env dosyasında
MONGODB_URI=mongodb://localhost:27017/risaleNurDB
```

### Osmanlıca Karakterler Görünmüyor
- UTF-8 encoding kontrolü
- Uygun font yüklü olmalı (Noto Naskh Arabic önerilir)

## 📁 Proje Yapısı

```
risale-nur-dijital/
├── backend/
│   ├── scripts/
│   │   ├── import-risale-nur.js    # Toplu import
│   │   ├── quick-import.js         # Test verisi
│   │   └── ...
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── views/admin/
│   │   │   ├── AdminBookImport.vue       # Toplu import
│   │   │   ├── AdminSingleBookImport.vue # Tekli import (YENİ!)
│   │   │   └── ...
│   │   └── ...
│   └── ...
└── ...
```

## 🚀 Önerilen Kullanım Akışı

1. **İlk Kurulum:** `quick-import.js` ile test
2. **Toplu Ekleme:** Diyanet klasöründen tüm kitaplar
3. **Tekli Ekleme:** Eksik veya yeni kitaplar için
4. **Düzenleme:** Admin panelden kitap/sayfa düzenleme

İyi kullanımlar! 📖