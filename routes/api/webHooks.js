const express = require('express')
const router = express.Router();
const bodyParser = require('body-parser'); 
const WebHookController = require('../../controllers/webHooks');


// router.post('/paystack-hook',bodyParser.raw({ type: 'application/json' }),WebHookController.dvaHook);
// router.post('/paystack-transferValidationhook',bodyParser.raw({ type: 'application/json' }),WebHookController.transferApprovalHook);
router.post('/paystack-hook',bodyParser.raw({ type: 'application/json' }),WebHookController.transactionHook);

module.exports=router;