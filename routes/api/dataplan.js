const express = require('express');
const router = express.Router();
const { authenticateToken ,requireAdmin} = require('../../middleware/auth');


const dataPlanController = require('../../controllers/dataplanControllers');

router.get('/',dataPlanController.getAllDataPlans);
router.get('/:planId',dataPlanController.getDataPlanById);
router.get('/object/:planObjectId',dataPlanController.getDataPlanByObjectId);
router.post('/',authenticateToken,requireAdmin,dataPlanController.createDataPlan);
// admin routes
router.put('/:planId',authenticateToken,requireAdmin,dataPlanController.updateDataPlan);
router.patch('/deactivate/:planId',authenticateToken,requireAdmin,dataPlanController.deactivatePlan);
router.patch('/activate/:planId',authenticateToken,requireAdmin,dataPlanController.activatePlan);

module.exports = router;