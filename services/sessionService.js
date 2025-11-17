const Session = require('../models/Session');
const apiError = require('../utils/apiError');

const createOrUpdateSession = async ({ userId, deviceInfo, ip }) => {
  return await Session.findOneAndUpdate(
    { userId, deviceInfo },
    { ip, lastUsed: new Date() },
    { upsert: true, new: true }
  );
};

const getUserSessions = async (userId) => {
  return await Session.find({ userId });
};

const terminateSession = async (sessionId) => {
  return await Session.findByIdAndDelete(sessionId);
};

module.exports = { createOrUpdateSession, getUserSessions, terminateSession };
