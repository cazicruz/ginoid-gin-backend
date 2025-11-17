const express = require('express');
const router = express.Router();
const AdminController = require('../../controllers/adminController')
const { authenticateToken ,requireAdmin} = require('../../middleware/auth');


router.use(authenticateToken);
// router.use(requireAdmin);

// router.get('/stats',AdminController.getAdminStats);
router.get('/users',AdminController.getAllUsers);
router.get('/user/:id',AdminController.getUserById);
router.patch('/user/:id/',AdminController.updateUser);
router.patch('/user/:id/deactivate',AdminController.deactivateUser);
router.delete('/user/:id',AdminController.deleteUser);
router.get('/users/paginate',AdminController.getPaginatedUsers);

module.exports = router;