const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(options) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email gönderildi:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email gönderme hatası:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .header h1 {
            color: #1a237e;
            margin: 0;
            font-size: 28px;
          }
          .arabic-text {
            font-size: 32px;
            color: #fbc02d;
            margin-bottom: 10px;
          }
          .content {
            color: #333333;
            line-height: 1.6;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #1a237e;
            color: #ffffff;
            text-decoration: none;
            border-radius: 30px;
            margin: 30px 0;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="arabic-text">رسائل النور</div>
            <h1>Risale-i Nur Dijital Kütüphane</h1>
          </div>
          
          <div class="content">
            <h2>Hoş Geldiniz, ${user.name}!</h2>
            <p>Risale-i Nur Dijital Kütüphane'ye üye olduğunuz için teşekkür ederiz.</p>
            <p>Hesabınızı aktifleştirmek için lütfen aşağıdaki butona tıklayın:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Hesabımı Doğrula</a>
            </div>
            
            <p style="font-size: 14px; color: #666;">Bu link 24 saat içinde geçerliliğini yitirecektir.</p>
            <p style="font-size: 14px; color: #666;">Eğer bu işlemi siz yapmadıysanız, lütfen bu emaili görmezden gelin.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Risale-i Nur Dijital Kütüphane</p>
            <p>Bu email otomatik olarak gönderilmiştir, lütfen yanıtlamayın.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      email: user.email,
      subject: 'Risale-i Nur Dijital Kütüphane - Hesap Doğrulama',
      html
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .header h1 {
            color: #1a237e;
            margin: 0;
            font-size: 28px;
          }
          .arabic-text {
            font-size: 32px;
            color: #fbc02d;
            margin-bottom: 10px;
          }
          .content {
            color: #333333;
            line-height: 1.6;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #1a237e;
            color: #ffffff;
            text-decoration: none;
            border-radius: 30px;
            margin: 30px 0;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="arabic-text">رسائل النور</div>
            <h1>Risale-i Nur Dijital Kütüphane</h1>
          </div>
          
          <div class="content">
            <h2>Şifre Sıfırlama</h2>
            <p>Merhaba ${user.name},</p>
            <p>Şifrenizi sıfırlamak için bir talepte bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki butona tıklayın:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>
            </div>
            
            <p style="font-size: 14px; color: #666;">Bu link 10 dakika içinde geçerliliğini yitirecektir.</p>
            <p style="font-size: 14px; color: #666;">Eğer bu talebi siz yapmadıysanız, lütfen bu emaili görmezden gelin.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Risale-i Nur Dijital Kütüphane</p>
            <p>Bu email otomatik olarak gönderilmiştir, lütfen yanıtlamayın.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      email: user.email,
      subject: 'Risale-i Nur Dijital Kütüphane - Şifre Sıfırlama',
      html
    });
  }
}

module.exports = new EmailService();