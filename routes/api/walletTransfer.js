const express = require('express');
const router = express.Router();
const { authenticateToken} = require('../../middleware/auth');
const transferController = require('../../controllers/transferController');

router.post('/transfer-balance', authenticateToken, transferController.transferBalance);

module.exports = router;