const express = require('express');
const router = express.Router();
const profileControllers = require('../controllers/profileControllers');

router.post("/sendName", profileControllers.sendName);
router.post("/sendAvatar", profileControllers.sendAvatar);

module.exports = router;