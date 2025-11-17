// jobs/algoliaQueue.js
const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

const algoliaQueue = new Queue("algolia-sync", { connection });
console.log("Job added:", algoliaQueue.id);


module.exports = { algoliaQueue,connection };
