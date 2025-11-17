const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
// const sendSMS = require('../utils/sendSMS');
const { generateOTP, verifyOTP, storeOTP } = require('./otpService');
const apiError = require('../utils/apiError');

const forgotPassword = async (email) => {
    const user = await User.findOne({ email: email });
    if (!user) { 
        throw apiError('User not found', 404, 'USER_NOT_FOUND');
    }
    const otp = await generateOTP();
    const identifier = email;
    await storeOTP(otp, identifier);
    await sendEmail(email, 'Password Reset OTP', `Your OTP is ${otp}`);
    return { success: true, message: 'OTP sent to email' };
}

const resetPassword = async (otp, newPassword,email) => {
    const user = await User.findOne({ email: email });
    if (!user) {
        throw apiError('User not found', 404, 'USER_NOT_FOUND');
    }
    const identifier = email;
    const isValidOTP = await verifyOTP(otp, identifier);
    if (!isValidOTP) {
        throw apiError('Invalid OTP', 400, 'INVALID_OTP');
    }
    user.password = newPassword;
    await user.save();
    return { success: true, message: 'Password reset successfully' };
}

const AuthService = {
    forgotPassword,
    resetPassword,
}
module.exports = AuthService;