const express = require('express');
const router = express.Router();
const searchControllers = require('../controllers/searchController');
const tvControllers = require('../controllers/tvControllers');

router.get("/search", searchControllers.searchTv);
router.get("/getAll", tvControllers.getAllByState);
router.get("/getAllData", tvControllers.getAllData);

module.exports = router;