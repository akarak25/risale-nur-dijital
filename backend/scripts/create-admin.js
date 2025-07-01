require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createAdminUser() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/risaleNurDB');
    console.log('MongoDB bağlantısı başarılı');
    
    // Admin kullanıcı bilgileri
    const adminData = {
      name: 'Admin',
      email: 'admin@risalenur.com',
      password: 'admin123', // Güvenlik için değiştirin!
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    };
    
    // Admin kullanıcısı var mı kontrol et
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut!');
      
      // Rolünü admin yap
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Kullanıcı rolü admin olarak güncellendi.');
      }
    } else {
      // Şifreyi hashle
      const salt = await bcrypt.genSalt(10);
      adminData.password = await bcrypt.hash(adminData.password, salt);
      
      // Admin kullanıcısını oluştur
      const admin = await User.create(adminData);
      console.log('Admin kullanıcısı oluşturuldu:');
      console.log('Email:', admin.email);
      console.log('Şifre: admin123 (Güvenlik için değiştirin!)');
    }
    
    console.log('\nAdmin paneline erişmek için:');
    console.log('1. http://localhost:8081/login adresine gidin');
    console.log('2. Email: admin@risalenur.com');
    console.log('3. Şifre: admin123');
    console.log('4. Giriş yaptıktan sonra /admin sayfasına gidin');
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nBağlantı kapatıldı.');
  }
}

// Kullanıcı parametrelerini al (opsiyonel)
const args = process.argv.slice(2);
if (args.length >= 2) {
  createCustomAdmin(args[0], args[1]);
} else {
  createAdminUser();
}

async function createCustomAdmin(email, password) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/risaleNurDB');
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const admin = await User.findOneAndUpdate(
      { email },
      {
        email,
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
        isEmailVerified: true,
        isActive: true
      },
      { upsert: true, new: true }
    );
    
    console.log(`Admin kullanıcısı oluşturuldu/güncellendi: ${email}`);
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.connection.close();
  }
}