require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@university.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'SecureAdminPass123!';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`ℹ️ Admin account (${adminEmail}) already exists. Skipping creation.`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const adminUser = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        isOnboarded: true,
      },
    });

    console.log(`✅ Admin account created successfully! ID: ${adminUser.id}, Email: ${adminUser.email}`);
  }

  console.log('🎉 Seed completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
