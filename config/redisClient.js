const { createClient } = require('redis');


const redisClient = createClient({
    username:  process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

// redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('🔌 Connecting to Redis...'));
redisClient.on('ready', () => console.log('✅ Redis ready'));
redisClient.on('end', () => console.log('❌ Redis disconnected'));
redisClient.on('reconnecting', () => console.log('♻️ Redis reconnecting...'));

const connectRedis = async () => {
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log('✅ Redis connected')
      }
    } catch (err) {
      console.error('Redis connection failed:', err);
    }
  };

module.exports = { redisClient, connectRedis };
