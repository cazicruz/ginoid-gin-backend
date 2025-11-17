const User = require('../models/User');
const apiError = require('../utils/apiError');
const paginate = require('../utils/paginate');



const getUserById = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new apiError('User not found', 404);
    }
    return user;
};

const getAllUsers = async () => {
    const users = await User.find();
    return users;
};

const paginateUsers = async (filter, options) => {
    return await paginate(User, filter, options);
};

const updateUser = async (userId, updateData) => {
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
        throw new apiError('User not found', 404);
    }
    return user;
};

const deactivateUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new apiError('User not found', 404);
    }
    user.isActive = !user.isActive;
    await user.save();
    return user;
};

const deleteUser = async (userId) => {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
        throw new apiError('User not found', 404);
    }
    return user;
};



const UserService = {
    getUserById,
    getAllUsers,
    paginateUsers,
    updateUser,
    deactivateUser,
    deleteUser
}

module.exports = UserService;