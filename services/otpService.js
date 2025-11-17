const bcrypt = require('bcryptjs');
const { redisClient, connectRedis } = require('../config/redisClient');
const apiError = require('../utils/apiError');

const generateOTP = async () => {
    return Math.floor(100000 + Math.random() * 900000);
};

const storeOTP = async (otp,identifier) => {
    await connectRedis();
    const hashedOTP = await bcrypt.hash(String(otp), 10);
    const key = `otp:${identifier}`;
    console.log(key);
    await redisClient.set(key, hashedOTP, { EX: 60 * 5 });
}

const storeEmailVerificationOTP = async (otp,verificationToken,identifier) => {
    await connectRedis();
    const payload={
        otp:otp,
        verificationToken:verificationToken,
    }
    const key = `verification:${identifier}`;
    await redisClient.set(key, JSON.stringify(payload), { EX: 60 * 5 });
}

const verifyEmailVerificationOTP = async (otp,verificationToken,identifier) => {
    await connectRedis();
    const key = `verification:${identifier}`;
    const payload = await redisClient.get(key);
    const parsedPayload = JSON.parse(payload);
    if(parsedPayload){
        console.log(parsedPayload);
        if(parsedPayload.otp == otp) return true
        if(parsedPayload.verificationToken== verificationToken) return true;
    }
    return false;
}

const verifyOTP = async (otp,identifier) => {
    await connectRedis();
    const key = `otp:${identifier}`;
    const hashedOTP = await redisClient.get(key);
    console.log(hashedOTP);
    if (!hashedOTP) {
        console.warn(`No OTP found for key: ${key}`);
        return false;
      }
    return await bcrypt.compare(String(otp), String(hashedOTP));
};

module.exports = { generateOTP, verifyOTP, storeOTP, storeEmailVerificationOTP, verifyEmailVerificationOTP };