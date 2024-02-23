const express = require('express');
const router = express.Router();
const verifyControllers = require('../controllers/verifyControllers');

router.post("/", verifyControllers.verify);
router.post("/checkCode", verifyControllers.checkValidation);

module.exports = router;