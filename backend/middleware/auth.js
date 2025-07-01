const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Kullanıcı kimlik doğrulama middleware'i
exports.protect = async (req, res, next) => {
  let token;

  // Token'ı header'dan al
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Token kontrolü
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Bu işlem için giriş yapmalısınız'
    });
  }

  try {
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kullanıcıyı bul ve req.user'a ekle
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Hesabınız devre dışı bırakılmış'
      });
    }

    next();
  } catch (error) {
    console.error('Auth middleware hatası:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Geçersiz token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token süresi dolmuş'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Kimlik doğrulama başarısız'
    });
  }
};

// Rol bazlı yetkilendirme
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Bu işlem için yetkiniz bulunmamaktadır'
      });
    }
    next();
  };
};

// Opsiyonel auth - Giriş yapmış kullanıcı varsa req.user'a ekle
exports.optionalAuth = async (req, res, next) => {
  let token;

  // Token'ı header'dan al
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Token yoksa devam et
  if (!token) {
    return next();
  }

  try {
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kullanıcıyı bul ve req.user'a ekle
    req.user = await User.findById(decoded.id);

    if (!req.user || !req.user.isActive) {
      req.user = null;
    }
  } catch (error) {
    // Hata olsa bile devam et, sadece req.user null olarak kalır
    req.user = null;
  }

  next();
};