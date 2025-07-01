require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const noteRoutes = require('./routes/noteRoutes');
const searchRoutes = require('./routes/searchRoutes');
const dictionaryRoutes = require('./routes/dictionaryRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/risaleNurDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => console.error('MongoDB bağlantı hatası:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dictionary', dictionaryRoutes);
app.use('/api/admin', adminRoutes);

// Ana route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Risale-i Nur Dijital Kütüphane API',
    version: '1.0.0',
    status: 'Çalışıyor'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Sayfa bulunamadı' });
});

// Hata yönetimi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Sunucu hatası oluştu!' });
});

// Port dinleme
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`📚 Risale-i Nur Dijital Kütüphane hazır!`);
});

module.exports = app;