const Redis = require('ioredis');

let redisClient = null;

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redisClient.on('connect', () => {
    console.log('✅ Connected to Upstash Redis');
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });
} else {
  console.warn('⚠️ REDIS_URL not provided. Redis caching disabled.');
}

module.exports = redisClient;
