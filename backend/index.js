require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const http = require('http');
const WebSocket = require('ws');

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

// HTTP Server oluştur
const server = http.createServer(app);

// WebSocket server oluştur
const wss = new WebSocket.Server({ 
  server,
  path: '/import'
});

// Global WebSocket client listesi
global.importClients = {};

// WebSocket bağlantılarını yönet
wss.on('connection', (ws, req) => {
  // URL'den import ID'yi al
  const urlParts = req.url.split('/');
  const importId = urlParts[urlParts.length - 1];
  
  console.log(`WebSocket bağlantısı kuruldu: ${importId}`);
  
  // Client'ı listeye ekle
  if (!global.importClients[importId]) {
    global.importClients[importId] = [];
  }
  global.importClients[importId].push(ws);
  
  // Mevcut durumu gönder
  if (global.importJobs && global.importJobs[importId]) {
    const job = global.importJobs[importId];
    
    // Mevcut logları gönder
    job.logs.forEach(log => {
      ws.send(JSON.stringify({
        type: 'log',
        level: log.type,
        message: log.message
      }));
    });
    
    // Durum bilgisi gönder
    if (job.status === 'completed') {
      ws.send(JSON.stringify({
        type: 'complete',
        message: 'İçe aktarma tamamlandı',
        stats: job.stats
      }));
    } else if (job.status === 'failed') {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'İçe aktarma başarısız'
      }));
    }
  }
  
  // Bağlantı kapandığında
  ws.on('close', () => {
    console.log(`WebSocket bağlantısı kapatıldı: ${importId}`);
    if (global.importClients[importId]) {
      global.importClients[importId] = global.importClients[importId].filter(client => client !== ws);
      if (global.importClients[importId].length === 0) {
        delete global.importClients[importId];
      }
    }
  });
  
  // Hata durumunda
  ws.on('error', (error) => {
    console.error('WebSocket hatası:', error);
  });
});

// Port dinleme
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`📚 Risale-i Nur Dijital Kütüphane hazır!`);
  console.log(`🔌 WebSocket server hazır`);
});

module.exports = app;