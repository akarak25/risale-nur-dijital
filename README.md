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

# JWT Configuration
JWT_SECRET=your_very_secure_secret_key_here
JWT_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Risale-i Nur Digital <noreply@risalenur.com>

# Frontend URL
FRONTEND_URL=http://localhost:8080
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

**Added to backend/package.json:**
```json
"bcryptjs": "^2.4.3",
"jsonwebtoken": "^9.0.2",
"express-validator": "^7.0.1",
"nodemailer": "^6.9.7"
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
│   │   ├── authController.js (NEW: Authentication)
│   │   ├── searchController.js (MODIFIED: Uses simple search)
│   │   ├── bookController.js
│   │   ├── bookmarkController.js (MODIFIED: Auth required)
│   │   ├── noteController.js (MODIFIED: Auth required)
│   │   └── dictionaryController.js
│   ├── models/ (Mongoose schemas)
│   │   ├── User.js (NEW: User authentication)
│   │   ├── Book.js
│   │   ├── Page.js
│   │   ├── Bookmark.js (MODIFIED: userId as ObjectId)
│   │   ├── Note.js (MODIFIED: userId as ObjectId)
│   │   └── Dictionary.js
│   ├── middleware/
│   │   └── auth.js (NEW: JWT verification)
│   ├── utils/
│   │   └── emailService.js (NEW: Email sending)
│   ├── routes/
│   │   ├── authRoutes.js (NEW: Auth endpoints)
│   │   ├── bookRoutes.js
│   │   ├── bookmarkRoutes.js (MODIFIED: Protected)
│   │   ├── noteRoutes.js (MODIFIED: Protected)
│   │   ├── searchRoutes.js
│   │   └── dictionaryRoutes.js
│   ├── scripts/
│   │   ├── seed-data.js (Sample data creation)
│   │   └── sync-elasticsearch.js (MODIFIED: MongoDB indexes only)
│   ├── .env (PORT=3001)
│   └── index.js (MODIFIED: ES dependency removed)
│
├── frontend/ (Vue.js 3 - Port 8081)
│   ├── src/
│   │   ├── store/
│   │   │   ├── index.js (MODIFIED: Added auth module)
│   │   │   └── modules/
│   │   │       └── auth.js (NEW: Auth state management)
│   │   ├── utils/
│   │   │   ├── axios.js (NEW: Axios interceptors)
│   │   │   └── auth.js (NEW: Auth helpers)
│   │   ├── views/
│   │   │   ├── LoginView.vue (NEW)
│   │   │   ├── RegisterView.vue (NEW)
│   │   │   ├── ProfileView.vue (NEW)
│   │   │   ├── ForgotPasswordView.vue (NEW)
│   │   │   └── ... (existing views)
│   │   ├── router/index.js (MODIFIED: Auth guards)
│   │   ├── App.vue (MODIFIED: Auth navigation)
│   │   └── components/
│   ├── .env (VUE_APP_API_URL=http://localhost:3001/api)
│   └── package.json
│
├── package.json (MODIFIED: Updated scripts)
└── README.md (THIS FILE)
```

## 🗄️ Veritabanı Yapısı

### MongoDB Collections:
1. **users** - Kullanıcı hesapları (NEW)
2. **books** - Kitap bilgileri
3. **pages** - Kitap sayfaları ve içerik
4. **bookmarks** - Kullanıcı yer imleri (Auth required)
5. **notes** - Kullanıcı notları (Auth required)
6. **dictionaries** - Kelime anlamları

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

### Authentication (NEW)
- `POST /auth/register` - Yeni kullanıcı kaydı
- `POST /auth/login` - Kullanıcı girişi
- `POST /auth/logout` - Çıkış (Protected)
- `GET /auth/me` - Mevcut kullanıcı bilgisi (Protected)
- `PUT /auth/updateprofile` - Profil güncelleme (Protected)
- `PUT /auth/updatepassword` - Şifre değiştirme (Protected)
- `PUT /auth/updatepreferences` - Tercih güncelleme (Protected)
- `POST /auth/forgotpassword` - Şifremi unuttum
- `PUT /auth/resetpassword/:token` - Şifre sıfırlama
- `GET /auth/verifyemail/:token` - Email doğrulama

### Books
- `GET /books` - Tüm kitaplar
- `GET /books/:id` - Belirli kitap
- `GET /books/:bookId/page/:pageNumber` - Kitap sayfası

### Search (MongoDB-based)
- `GET /search/basic?query=...` - Basit arama
- `GET /search/advanced?query=...&bookId=...` - Gelişmiş arama
- `GET /search/books?query=...` - Kitap araması

### Bookmarks (🔒 Protected)
- `GET /bookmarks/my` - Kullanıcının yer imleri
- `GET /bookmarks/book/:bookId` - Kitaptaki yer imleri
- `POST /bookmarks` - Yeni yer imi
- `PUT /bookmarks/:id` - Yer imi güncelle
- `DELETE /bookmarks/:id` - Yer imi sil

### Notes (🔒 Protected)
- `GET /notes/my` - Kullanıcının notları
- `GET /notes/book/:bookId` - Kitaptaki notlar
- `GET /notes/book/:bookId/page/:pageNumber` - Sayfadaki notlar
- `POST /notes` - Yeni not
- `PUT /notes/:id` - Not güncelle
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
- ✅ Kullanıcı authentication sistemi (JWT)
- ✅ Email doğrulama ve şifre sıfırlama
- ✅ Kullanıcı profil yönetimi
- ✅ Kitap görüntüleme (Turn.js sayfa çevirme)
- ✅ Kişiselleştirilmiş not alma sistemi
- ✅ Kişiselleştirilmiş yer imi sistemi  
- ✅ MongoDB tabanlı arama
- ✅ Sözlük entegrasyonu
- ✅ Kullanıcı tercihleri (veritabanında saklanır)
- ✅ Okuma istatistikleri
- ✅ Responsive tasarım
- ✅ 3 tema desteği (light, dark, sepia)

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
// Main store structure
state: {
  books: [],
  currentBook: null,
  currentPage: null,
  bookmarks: [],
  notes: [],
  userSettings: {},
  searchResults: [],
  loading: false,
  error: null,
  notification: null
}

// Auth module state
auth: {
  token: null,
  user: null,
  loading: false,
  error: null
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
- ~~No authentication system~~ ✅ Implemented
- ~~No user management~~ ✅ Implemented
- No real-time features
- Limited error handling
- No rate limiting
- No API documentation (Swagger)
- No automated tests

### Improvement Areas
- Add TypeScript
- Implement caching
- Add testing framework
- Improve search relevance
- Add pagination

## 📚 Sample Data Structure

### User Document (NEW)
```json
{
  "_id": "ObjectId",
  "name": "Ahmet Yılmaz",
  "email": "ahmet@example.com",
  "password": "$2a$10$...(bcrypt hash)",
  "role": "user",
  "isActive": true,
  "isEmailVerified": true,
  "preferences": {
    "fontSize": 16,
    "fontFamily": "Noto Serif",
    "lineHeight": 1.6,
    "theme": "light",
    "pageAnimations": true,
    "pageSound": true
  },
  "readingHistory": [
    {
      "bookId": "ObjectId",
      "lastPage": 125,
      "lastReadAt": "2024-01-15T10:30:00Z"
    }
  ],
  "createdAt": "2024-01-01T12:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

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

### Bookmark Document (MODIFIED)
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "bookId": "ObjectId",
  "pageNumber": 125,
  "name": "Önemli Bölüm",
  "color": "#3498db",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Note Document (MODIFIED)
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "bookId": "ObjectId",
  "pageNumber": 125,
  "content": "Bu bölüm çok önemli...",
  "position": { "x": 100, "y": 200 },
  "color": "#f1c40f",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

---

**Note for AI Models**: This project is a functional digital library for Risale-i Nur works with complete authentication system. MongoDB is required but Elasticsearch has been replaced with simple MongoDB text search. All necessary scripts and configurations are provided above.

**Authentication System**: The project now includes full user authentication with JWT tokens, email verification, password reset, and user preferences. Make sure to configure email settings in `.env` file for email features to work properly.
