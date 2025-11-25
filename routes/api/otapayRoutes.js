const express = require('express');
const router = express.Router();
const { authenticateToken ,requireAdmin} = require('../../middleware/auth');

const otaPayController = require('../../controllers/otaPayController');

router.post('/purchase-data-bundle',authenticateToken,otaPayController.purchaseDataBundle);
router.post('/purchase-airtime',authenticateToken,otaPayController.purchaseAirtime);
router.get('/transaction-status',authenticateToken,otaPayController.getTransactionStatus);
router.get('/wallet-balance',authenticateToken,otaPayController.getWalletBalance);

module.exports = router;
