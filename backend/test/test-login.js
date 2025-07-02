const axios = require('axios');

async function testLogin() {
  try {
    console.log('Login test başlıyor...\n');
    
    const loginData = {
      email: 'admin@risalenur.com',
      password: 'admin123'
    };
    
    console.log('Gönderilen veriler:');
    console.log('Email:', loginData.email);
    console.log('Password:', loginData.password);
    
    const response = await axios.post('http://localhost:3001/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ Login başarılı!');
    console.log('Token:', response.data.token);
    console.log('Kullanıcı:', response.data.user);
    
  } catch (error) {
    console.log('\n❌ Login başarısız!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Hata mesajı:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n401 Unauthorized - Olası sebepler:');
        console.log('1. Email veya şifre yanlış');
        console.log('2. Hesap aktif değil');
        console.log('3. JWT token oluşturma sorunu');
      }
    } else {
      console.log('Hata:', error.message);
    }
  }
}

// Backend'in başlaması için 2 saniye bekle
console.log('Backend\'in hazır olması bekleniyor...');
setTimeout(testLogin, 2000);
