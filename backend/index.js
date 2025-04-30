require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { Client } = require('elasticsearch');

// Routes
const bookRoutes = require('./routes/bookRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const noteRoutes = require('./routes/noteRoutes');
const searchRoutes = require('./routes/searchRoutes');
const dictionaryRoutes = require('./routes/dictionaryRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// MongoDB Bağlantısı
mongoose.connect('mongodb://localhost:27017/risaleNurDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => console.error('MongoDB bağlantı hatası:', err));

// Elasticsearch Bağlantısı
const esClient = new Client({
  node: 'http://localhost:9200'
});

// Elasticsearch bağlantı kontrolü
esClient.ping({
  requestTimeout: 30000,
}, function(error) {
  if (error) {
    console.error('Elasticsearch bağlantı hatası:', error);
  } else {
    console.log('Elasticsearch bağlantısı başarılı');
  }
});

// Global middleware olarak Elasticsearch client'ı ekle
app.use((req, res, next) => {
  req.esClient = esClient;
  next();
});

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dictionary', dictionaryRoutes);

// Ana route
app.get('/', (req, res) => {
  res.send('Risale-i Nur Dijital Kütüphane API');
});

// Hata yönetimi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Bir şeyler yanlış gitti!' });
});

// Port dinleme
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});

module.exports = app;