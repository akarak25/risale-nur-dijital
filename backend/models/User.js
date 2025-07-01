const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim alanı zorunludur'],
    trim: true,
    minLength: [2, 'İsim en az 2 karakter olmalıdır'],
    maxLength: [50, 'İsim en fazla 50 karakter olabilir']
  },
  email: {
    type: String,
    required: [true, 'Email alanı zorunludur'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Lütfen geçerli bir email adresi girin'
    ]
  },
  password: {
    type: String,
    required: [true, 'Şifre alanı zorunludur'],
    minLength: [6, 'Şifre en az 6 karakter olmalıdır'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: {
    type: Date,
    default: null
  },
  preferences: {
    fontSize: {
      type: Number,
      default: 16,
      min: 12,
      max: 24
    },
    fontFamily: {
      type: String,
      default: 'Noto Serif',
      enum: ['Noto Serif', 'Roboto', 'Amiri', 'Arial', 'Georgia']
    },
    lineHeight: {
      type: Number,
      default: 1.6,
      min: 1,
      max: 2
    },
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'sepia']
    },
    pageAnimations: {
      type: Boolean,
      default: true
    },
    pageSound: {
      type: Boolean,
      default: true
    }
  },
  readingHistory: [{
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    lastPage: Number,
    lastReadAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Şifre hashleme
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// JWT Token oluşturma
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Şifre karşılaştırma
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Şifre sıfırlama token'ı oluşturma
userSchema.methods.getResetPasswordToken = function() {
  // Random token oluştur
  const resetToken = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
  
  // Token'ı hashle ve kaydet
  this.resetPasswordToken = bcrypt.hashSync(resetToken, 10);
  
  // Token süresini ayarla (10 dakika)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

// Email doğrulama token'ı oluşturma
userSchema.methods.getEmailVerificationToken = function() {
  // Random token oluştur
  const verificationToken = Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15);
  
  // Token'ı hashle ve kaydet
  this.emailVerificationToken = bcrypt.hashSync(verificationToken, 10);
  
  // Token süresini ayarla (24 saat)
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
  
  return verificationToken;
};

// Virtual field: kullanıcının tam adı
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Kullanıcı bilgilerini JSON'a çevirirken hassas bilgileri çıkar
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpire;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;