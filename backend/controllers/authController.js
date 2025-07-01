const User = require('../models/User');
const emailService = require('../utils/emailService');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Token ile response gönderme helper'ı
const sendTokenResponse = (user, statusCode, res) => {
  // Token oluştur
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user
  });
};

// @desc    Kullanıcı kaydı
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    // Validation hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Bu email adresi zaten kullanılıyor'
      });
    }

    // Kullanıcı oluştur
    const user = await User.create({
      name,
      email,
      password
    });

    // Email doğrulama token'ı oluştur
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Hoş geldin emaili gönder
    await emailService.sendWelcomeEmail(user, verificationToken);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Kayıt işlemi sırasında bir hata oluştu'
    });
  }
};

// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    // Validation hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Kullanıcıyı bul (+password ile)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email veya şifre hatalı'
      });
    }

    // Şifre kontrolü
    const isPasswordMatched = await user.matchPassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        error: 'Email veya şifre hatalı'
      });
    }

    // Hesap aktif mi kontrolü
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Hesabınız devre dışı bırakılmış'
      });
    }

    // Son giriş zamanını güncelle
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Giriş işlemi sırasında bir hata oluştu'
    });
  }
};

// @desc    Kullanıcı çıkışı
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Mevcut kullanıcıyı getir
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Kullanıcı bilgisi hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Kullanıcı bilgileri alınamadı'
    });
  }
};

// @desc    Profil güncelleme
// @route   PUT /api/auth/updateprofile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
    };

    // Email değişiyorsa kontrol et
    if (req.body.email && req.body.email !== req.user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Bu email adresi zaten kullanılıyor'
        });
      }
      // Email değiştiğinde doğrulama durumunu sıfırla
      fieldsToUpdate.isEmailVerified = false;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Profil güncellenirken bir hata oluştu'
    });
  }
};

// @desc    Şifre değiştirme
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Mevcut şifre kontrolü
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        error: 'Mevcut şifre hatalı'
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Şifre değiştirilirken bir hata oluştu'
    });
  }
};

// @desc    Tercih güncelleme
// @route   PUT /api/auth/updatepreferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Tercihleri güncelle
    if (req.body.fontSize !== undefined) user.preferences.fontSize = req.body.fontSize;
    if (req.body.fontFamily !== undefined) user.preferences.fontFamily = req.body.fontFamily;
    if (req.body.lineHeight !== undefined) user.preferences.lineHeight = req.body.lineHeight;
    if (req.body.theme !== undefined) user.preferences.theme = req.body.theme;
    if (req.body.pageAnimations !== undefined) user.preferences.pageAnimations = req.body.pageAnimations;
    if (req.body.pageSound !== undefined) user.preferences.pageSound = req.body.pageSound;
    
    await user.save();

    res.status(200).json({
      success: true,
      data: user.preferences
    });
  } catch (error) {
    console.error('Tercih güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Tercihler güncellenirken bir hata oluştu'
    });
  }
};

// @desc    Şifremi unuttum
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı'
      });
    }

    // Reset token oluştur
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Email gönder
    const emailResult = await emailService.sendPasswordResetEmail(user, resetToken);

    if (!emailResult.success) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        error: 'Email gönderilemedi'
      });
    }

    res.status(200).json({
      success: true,
      data: 'Şifre sıfırlama emaili gönderildi'
    });
  } catch (error) {
    console.error('Şifremi unuttum hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Şifre sıfırlama işlemi sırasında bir hata oluştu'
    });
  }
};

// @desc    Şifre sıfırlama
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Token'ı hashle
    const resetPasswordToken = bcrypt.hashSync(req.params.resettoken, 10);

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz veya süresi dolmuş token'
      });
    }

    // Yeni şifreyi kaydet
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Şifre sıfırlama işlemi sırasında bir hata oluştu'
    });
  }
};

// @desc    Email doğrulama
// @route   GET /api/auth/verifyemail/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    // Token'ı hashle
    const emailVerificationToken = bcrypt.hashSync(req.params.token, 10);

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz veya süresi dolmuş token'
      });
    }

    // Email'i doğrula
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      data: 'Email başarıyla doğrulandı'
    });
  } catch (error) {
    console.error('Email doğrulama hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Email doğrulama işlemi sırasında bir hata oluştu'
    });
  }
};