const jwt = require('jsonwebtoken');
const { redisClient, connectRedis } = require('../config/redisClient');
const apiError = require('../utils/apiError');

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const generateTokens = async (user, deviceId) => {
    await connectRedis();
  const accessToken = jwt.sign({ 
    userId:user._id, 
    email: user.email, 
    role: user.role,
    deviceId: deviceId
  }, ACCESS_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ 
    userId: user._id, 
    deviceId: deviceId
  }, REFRESH_SECRET, { expiresIn: '7d' });

  // Store in Redis: key = refreshToken, value = userId
  await redisClient.set(refreshToken, user._id.toString(), { EX: 7 * 24 * 60 * 60 });

  return { accessToken, refreshToken };
};

const verifyRefreshToken = async (token) => {
  await connectRedis();
  const decoded = jwt.verify(token, REFRESH_SECRET);
  const userIdInRedis = await redisClient.get(token);

  if (!userIdInRedis || userIdInRedis !== decoded.userId) {
    throw apiError('Invalid or revoked refresh token', 400, 'INVALID_REFRESH_TOKEN');
  }

  return decoded;
};

const revokeRefreshToken = async (token) => {
  await connectRedis();
  await redisClient.del(token);
};

module.exports = { generateTokens, verifyRefreshToken, revokeRefreshToken };
