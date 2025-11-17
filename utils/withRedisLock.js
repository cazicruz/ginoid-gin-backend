// utils/withRedisLock.js
const redisClient = require('../config/redis');
const apiError = require('./apiError');

/**
 * Safely executes a critical section with Redis locking.
 *
 * @param {string} key - Unique lock key, e.g. 'withdrawal_lock:user123'
 * @param {number} ttl - Time to hold lock in milliseconds (e.g. 30000 for 30s)
 * @param {function} callback - Async function to execute inside the lock
 * @returns {Promise<any>} - Result of the callback if successful
 * @throws {Error} - If lock is already taken or callback throws
 */
async function withRedisLock(redisClient, lockKey, ttl, fn) {
  // Try to acquire lock
  const lock = await redisClient.set(lockKey, 'locked', { NX: true, PX: ttl });
  if (!lock) {
    throw apiError('Resource is locked. Please try again later.', 429);
  }
  try {
    return await fn();
  } catch (err) {
    throw apiError('Error in locked operation', 500, err);
  } finally {
    await redisClient.del(lockKey);
  }
}

module.exports = withRedisLock;
