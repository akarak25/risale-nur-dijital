require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkAdminUser() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/risaleNurDB');
    console.log('MongoDB bağlantısı başarılı\n');
    
    // Tüm kullanıcıları listele
    const users = await User.find({}, 'email role isActive isEmailVerified createdAt');
    console.log(`Toplam kullanıcı sayısı: ${users.length}\n`);
    
    if (users.length > 0) {
      console.log('Mevcut kullanıcılar:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Rol: ${user.role}`);
        console.log(`   Aktif: ${user.isActive}`);
        console.log(`   Email Doğrulandı: ${user.isEmailVerified}`);
        console.log(`   Oluşturulma: ${user.createdAt}\n`);
      });
    }
    
    // Admin kullanıcısını kontrol et
    const adminUser = await User.findOne({ email: 'admin@risalenur.com' });
    
    if (adminUser) {
      console.log('✅ Admin kullanıcısı mevcut!');
      console.log('Admin detayları:');
      console.log('- ID:', adminUser._id);
      console.log('- İsim:', adminUser.name);
      console.log('- Email:', adminUser.email);
      console.log('- Rol:', adminUser.role);
      console.log('- Aktif:', adminUser.isActive);
      console.log('- Email Doğrulandı:', adminUser.isEmailVerified);
    } else {
      console.log('❌ Admin kullanıcısı bulunamadı!');
      console.log('Lütfen create-admin.js scriptini çalıştırın.');
    }
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nBağlantı kapatıldı.');
  }
}

checkAdminUser();
