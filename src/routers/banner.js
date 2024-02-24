const express = require('express');
const router = express.Router();
const bannerControllers = require('../controllers/bannerControllers');

router.get("/getAll", bannerControllers.getAll);

module.exports = router;