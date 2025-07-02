require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function testAdminPassword() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/risaleNurDB');
    console.log('MongoDB bağlantısı başarılı\n');
    
    // Admin kullanıcısını bul (password alanı ile birlikte)
    const adminUser = await User.findOne({ email: 'admin@risalenur.com' }).select('+password');
    
    if (!adminUser) {
      console.log('❌ Admin kullanıcısı bulunamadı!');
      return;
    }
    
    console.log('✅ Admin kullanıcısı bulundu!');
    console.log('Email:', adminUser.email);
    console.log('Rol:', adminUser.role);
    
    // Test edilecek şifre
    const testPassword = 'admin123';
    
    // Şifre kontrolü
    console.log('\nŞifre kontrolü yapılıyor...');
    const isMatch = await bcrypt.compare(testPassword, adminUser.password);
    
    if (isMatch) {
      console.log('✅ Şifre doğru! (admin123)');
    } else {
      console.log('❌ Şifre yanlış!');
      console.log('Şifreyi yeniden ayarlayalım...');
      
      // Yeni şifre hash'le
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Güncelle
      adminUser.password = hashedPassword;
      await adminUser.save({ validateBeforeSave: false });
      
      console.log('✅ Şifre yeniden ayarlandı: admin123');
    }
    
    // JWT Secret kontrolü
    console.log('\nJWT Secret kontrolü:');
    if (process.env.JWT_SECRET) {
      console.log('✅ JWT_SECRET tanımlı');
      console.log('JWT_SECRET uzunluğu:', process.env.JWT_SECRET.length);
    } else {
      console.log('❌ JWT_SECRET tanımlı değil!');
    }
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nBağlantı kapatıldı.');
  }
}

testAdminPassword();
