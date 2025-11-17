// workers/algoliaWorker.ts
const { Worker }= require("bullmq");
require('dotenv').config();
const IORedis = require("ioredis");
// const {connection} =require('../jobs/algoliaQueue')
const { addOrUpdateProduct, deleteProduct ,bulkDelete}= require("../utils/algoliaSearch");
const host=process.env.REDIS_HOST
const port=process.env.REDIS_PORT

console.log(host,port);

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,

  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: process.env.REDIS_TLS === "true" ? {} : undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

connection.on('connect', () => {
  console.log('✅ Connected to Redis successfully');
});

connection.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

const worker = new Worker(
  "algolia-sync",
  async (job) => {
    if (job.name === "addOrUpdate") {
      await addOrUpdateProduct(job.data.product);
    }

    if (job.name === "delete") {
      await deleteProduct(job.data.id);
    }

    if (job.name === "deleteMany") {
        await bulkDelete(job.data.ids);
    }
  },
  { connection }
);



worker.on('ready', () => {
console.log('🚀 Algolia worker is ready and listening for jobs...');
});

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} (${job.name}) completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

// Graceful shutdown handlers
const shutdown = async () => {
console.log('🛑 Shutting down worker...');
  console.log('⏳ Waiting for active jobs to complete...');
  await worker.close();
  console.log('✅ All jobs completed, closing Redis connection...');
  await connection.quit();
  console.log('👋 Worker shut down successfully');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
