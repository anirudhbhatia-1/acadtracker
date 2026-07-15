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

  // Seed default courses for student onboarding
  const sampleCourses = [
    {
      name: 'B.Tech Computer Science & Engineering',
      code: 'CSE_BTECH',
      department: 'Computer Science',
      totalSemesters: 8,
    },
    {
      name: 'B.Tech Electronics & Communication',
      code: 'ECE_BTECH',
      department: 'Electronics',
      totalSemesters: 8,
    },
    {
      name: 'B.Tech Mechanical Engineering',
      code: 'ME_BTECH',
      department: 'Mechanical',
      totalSemesters: 8,
    },
  ];

  for (const courseData of sampleCourses) {
    const existingCourse = await prisma.course.findUnique({
      where: { code: courseData.code },
    });
    if (!existingCourse) {
      const created = await prisma.course.create({ data: courseData });
      console.log(`✅ Seeded course: ${created.name} (${created.code})`);
    } else {
      console.log(`ℹ️ Course ${courseData.code} already exists.`);
    }
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
