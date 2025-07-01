const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  updatePreferences,
  forgotPassword,
  resetPassword,
  verifyEmail
} = require('../controllers/authController');

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('İsim 2-50 karakter arasında olmalıdır'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir email adresi giriniz'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır')
    .matches(/\d/)
    .withMessage('Şifre en az bir rakam içermelidir')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir email adresi giriniz'),
  body('password')
    .notEmpty()
    .withMessage('Şifre alanı zorunludur')
];

const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mevcut şifre zorunludur'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Yeni şifre en az 6 karakter olmalıdır')
    .matches(/\d/)
    .withMessage('Yeni şifre en az bir rakam içermelidir')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir email adresi giriniz')
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır')
    .matches(/\d/)
    .withMessage('Şifre en az bir rakam içermelidir')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgotpassword', forgotPasswordValidation, forgotPassword);
router.put('/resetpassword/:resettoken', resetPasswordValidation, resetPassword);
router.get('/verifyemail/:token', verifyEmail);

// Protected routes
router.use(protect); // Bu satırdan sonraki tüm route'lar korumalı

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/updateprofile', updateProfile);
router.put('/updatepassword', updatePasswordValidation, updatePassword);
router.put('/updatepreferences', updatePreferences);

module.exports = router;