const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Basit metin araması
router.get('/basic', searchController.basicSearch);

// Gelişmiş arama (Elasticsearch)
router.get('/advanced', searchController.advancedSearch);

// Kelime anlamı ara
router.get('/word/:word', searchController.searchWord);

module.exports = router;