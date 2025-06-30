# Risale-i Nur Dijital Kütüphane - AI Assistant Guide

## 🤖 For AI Models & Assistants

Bu README, AI asistanları ve modellerinin Risale-i Nur Dijital Kütüphane projesini anlayabilmesi ve üzerinde çalışabilmesi için hazırlanmıştır.

## 📋 Proje Durumu (Current State)

### ✅ Aktif Teknolojiler
- **Backend**: Node.js/Express.js (Port 3001)
- **Frontend**: Vue.js 3 (Port 8081)  
- **Database**: MongoDB (Local - Port 27017)
- **Search**: MongoDB Text Search (Elasticsearch removed)

### ❌ Kaldırılan Bağımlılıklar
- Elasticsearch (Dependency removed due to installation complexity)
- Related ES packages in package.json

## 🔧 Yapılan Değişiklikler (AI Assistant Changes)

### 1. Port Konfigürasyonları
```
Backend: 3000 → 3001 (Port conflict resolution)
Frontend: 8080 → 8081 (Auto-assigned by Vue CLI)
```

### 2. Environment Files
**backend/.env:**
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/risaleNurDB
NODE_ENV=development
```

**frontend/.env:**
```
VUE_APP_API_URL=http://localhost:3001/api
```

### 3. Search System Replacement
- **Removed**: Elasticsearch integration
- **Added**: `backend/config/simple-search.js` - MongoDB-based search
- **Modified**: `backend/controllers/searchController.js` - Uses simple search
- **Updated**: Index creation script - MongoDB text indexes only

### 4. Package Dependencies
**Removed from backend/package.json:**
```json
"elasticsearch": "^16.7.3"
```

### 5. Script Updates
**package.json scripts:**
```json
{
  "setup:db": "cd backend && node scripts/seed-data.js && node scripts/sync-elasticsearch.js",
  "seed": "cd backend && node scripts/seed-data.js",
  "index": "cd backend && node scripts/sync-elasticsearch.js"
}
```

## 🏗️ Proje Mimarisi

```
risale-nur-dijital/
├── backend/ (Node.js API - Port 3001)
│   ├── config/
│   │   ├── simple-search.js (NEW: MongoDB-based search)
│   │   └── elasticsearch.js (REMOVED: ES config)
│   ├── controllers/
│   │   ├── searchController.js (MODIFIED: Uses simple search)
│   │   ├── bookController.js
│   │   ├── bookmarkController.js
│   │   ├── noteController.js
│   │   └── dictionaryController.js
│   ├── models/ (Mongoose schemas)
│   │   ├── Book.js
│   │   ├── Page.js
│   │   ├── Bookmark.js
│   │   ├── Note.js
│   │   └── Dictionary.js
│   ├── scripts/
│   │   ├── seed-data.js (Sample data creation)
│   │   └── sync-elasticsearch.js (MODIFIED: MongoDB indexes only)
│   ├── .env (PORT=3001)
│   └── index.js (MODIFIED: ES dependency removed)
│
├── frontend/ (Vue.js 3 - Port 8081)
│   ├── src/
│   │   ├── store/index.js (Vuex - API_URL updated)
│   │   ├── components/
│   │   ├── views/
│   │   └── router/
│   ├── .env (VUE_APP_API_URL=http://localhost:3001/api)
│   └── package.json
│
├── package.json (MODIFIED: Updated scripts)
└── README.md (THIS FILE)
```

## 🗄️ Veritabanı Yapısı

### MongoDB Collections:
1. **books** - Kitap bilgileri
2. **pages** - Kitap sayfaları ve içerik
3. **bookmarks** - Kullanıcı yer imleri  
4. **notes** - Kullanıcı notları
5. **dictionaries** - Kelime anlamları

### MongoDB Indexes (Text Search):
```javascript
// Books collection
{ title: 'text', description: 'text', author: 'text' }

// Pages collection  
{ content: 'text', chapter: 'text', subChapter: 'text' }

// Dictionaries collection
{ word: 'text', meaning: 'text' }
```

## 🔌 API Endpoints

**Base URL**: `http://localhost:3001/api`

### Books
- `GET /books` - Tüm kitaplar
- `GET /books/:id` - Belirli kitap
- `GET /books/:bookId/page/:pageNumber` - Kitap sayfası

### Search (MongoDB-based)
- `GET /search/basic?query=...` - Basit arama
- `GET /search/advanced?query=...&bookId=...` - Gelişmiş arama
- `GET /search/books?query=...` - Kitap araması

### Bookmarks
- `GET /bookmarks/user/:userId` - Kullanıcı yer imleri
- `POST /bookmarks` - Yeni yer imi
- `DELETE /bookmarks/:id` - Yer imi sil

### Notes
- `GET /notes/user/:userId` - Kullanıcı notları
- `POST /notes` - Yeni not
- `DELETE /notes/:id` - Not sil

### Dictionary
- `GET /dictionary/word/:word` - Kelime anlamı

## 🚀 Kurulum Komutları (AI Model Reference)

### Gereksinimler
- Node.js 14+
- MongoDB (Local installation)
- NO Elasticsearch needed

### Kurulum Sırası
```bash
# 1. Bağımlılıkları kur
npm install
npm run install:all

# 2. Veritabanını oluştur
npm run seed        # Örnek veriler
npm run index       # MongoDB indexes

# 3. Başlat
npm run dev         # Hem backend hem frontend
```

### Manuel Başlatma
```bash
# Backend (Terminal 1)
cd backend
npm run dev         # Port 3001

# Frontend (Terminal 2)  
cd frontend
npm run serve       # Port 8081
```

## 🔧 Sorun Giderme (AI Reference)

### Port Çakışması
- Backend default: 3001
- Frontend auto-assign: 8081
- MongoDB: 27017

### MongoDB Bağlantı
```javascript
// Test connection
mongoose.connect('mongodb://localhost:27017/risaleNurDB')
```

### Index Conflicts
```bash
# Temizle ve yeniden oluştur
npm run index
```

## 📊 Özellikler (AI Understanding)

### Çalışan Özellikler
- ✅ Kitap görüntüleme (Turn.js sayfa çevirme)
- ✅ Not alma sistemi
- ✅ Yer imi sistemi  
- ✅ MongoDB tabanlı arama
- ✅ Sözlük entegrasyonu
- ✅ Kullanıcı ayarları (localStorage)
- ✅ Responsive tasarım

### Arama Sistemi (MongoDB-based)
```javascript
// Backend: simple-search.js
- Text search with regex
- Category filtering
- Fuzzy matching
- Turkish character support
```

### Frontend State (Vuex)
```javascript
// Store structure
state: {
  books: [],
  currentBook: null,
  currentPage: null,
  bookmarks: [],
  notes: [],
  userSettings: {},
  searchResults: []
}
```

## 🎯 AI Assistant Tasks

AI models can help with:

1. **Code Debugging**: Fix Vue.js/Node.js issues
2. **Feature Development**: Add new functionality
3. **Database Operations**: MongoDB queries and schemas
4. **Search Improvements**: Enhance MongoDB text search
5. **UI/UX Enhancements**: Vue component improvements
6. **Performance Optimization**: Query optimization
7. **Error Handling**: Better error management
8. **Testing**: Add unit/integration tests

## 🔍 Development Context

### Known Issues
- Sass deprecation warnings (non-breaking)
- MongoDB index conflicts (resolved in sync script)
- Turn.js jQuery dependency (working)

### Technical Debt
- No authentication system
- No user management
- No real-time features
- Limited error handling

### Improvement Areas
- Add TypeScript
- Implement caching
- Add testing framework
- Improve search relevance
- Add pagination

## 📚 Sample Data Structure

### Book Document
```json
{
  "_id": "ObjectId",
  "title": "Sözler",
  "author": "Bediüzzaman Said Nursi",
  "category": "Risale-i Nur",
  "description": "...",
  "pageCount": 850,
  "publishYear": 1926
}
```

### Page Document
```json
{
  "_id": "ObjectId", 
  "bookId": "ObjectId",
  "pageNumber": 1,
  "content": "Sayfa içeriği...",
  "chapter": "Birinci Söz",
  "subChapter": "Giriş"
}
```

---

**Note for AI Models**: This project is a functional digital library for Risale-i Nur works. MongoDB is required but Elasticsearch has been replaced with simple MongoDB text search. All necessary scripts and configurations are provided above.
