require('dotenv').config();
const app = require('./src/app');
const prisma = require('./src/config/db');
const redisClient = require('./src/config/redis');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Check Prisma DB connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database via Prisma');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        if (redisClient) {
          redisClient.disconnect();
        }
        console.log('🏁 Server and database connections closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
