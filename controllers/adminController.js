const catchAsync = require('../utils/catchAsync');
const {ApiError} = require('../utils/apiError');
const userService = require('../services/userService');


const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await userService.getAllUsers();
    res.status(200).json({
        status: 'success',
        data: {
            users
        }
    });
});

const getUserById = catchAsync(async (req, res, next) => {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});
const updateUser = catchAsync(async (req, res, next) => {
    const { email, phone, address } = req.body;
    const isAdmin = req.user.role === 'admin';
    const role = isAdmin ? req.body.role : undefined;
    let updateObj = {};

    if (email) updateObj.email = email;
    if (phone) updateObj.phone = phone;
    if (address) updateObj.address = address;
    if (role) updateObj.role = role;

    const user = await userService.updateUser(req.params.id, updateObj);
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

const deactivateUser = catchAsync(async (req, res, next) => {
    const user = await userService.deactivateUser(req.params.id);
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

const deleteUser = catchAsync(async (req, res, next) => {
    const user = await userService.deleteUser(req.params.id);
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

const getPaginatedUsers = catchAsync(async (req, res, next) => {
    const { page, limit, skip } = req.query;
    const users = await userService.paginateUsers({}, { page, limit, skip });
    res.status(200).json({
        status: 'success',
        data: {
            users
        }
    });
});



const adminUserManagement = {
    getAllUsers,
    getUserById,
    getPaginatedUsers,
    updateUser,
    deactivateUser,
    deleteUser
};

// admin routes for order management will go here
module.exports = adminUserManagement;