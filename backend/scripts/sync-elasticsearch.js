require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { syncData } = require('../config/elasticsearch');

// MongoDB'ye bağlan
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/risaleNurDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB bağlantısı başarılı');
  
  // Elasticsearch senkronizasyonunu başlat
  return syncData();
})
.then(result => {
  console.log('Elasticsearch senkronizasyonu ' + (result ? 'başarılı' : 'başarısız'));
  process.exit(result ? 0 : 1);
})
.catch(err => {
  console.error('Senkronizasyon hatası:', err);
  process.exit(1);
});