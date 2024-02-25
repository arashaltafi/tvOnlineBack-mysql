const express = require('express');
const router = express.Router();
const searchControllers = require('../controllers/searchController');

router.get("/search", searchControllers.searchTv);

module.exports = router;