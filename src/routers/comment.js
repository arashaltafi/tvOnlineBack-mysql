const express = require('express');
const router = express.Router();
const commentControllers = require('../controllers/commentControllers');

router.post("/send", commentControllers.sendComment);
router.get("/getMyComments", commentControllers.getMyComments);
router.get("/getAll/:id", commentControllers.getAllById);

module.exports = router;