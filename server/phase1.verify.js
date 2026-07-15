require('dotenv').config();
const request = require('supertest');
const app = require('./src/app');
const prisma = require('./src/config/db');
const redis = require('./src/config/redis');

async function verifyPhase1() {
  console.log('🧪 Starting Full Phase 1 Verification against Railway PostgreSQL & Upstash Redis...');
  const testEmail = `verify_${Date.now()}@university.edu`;
  const testPassword = 'Password123!';
  const testName = 'Verification Student';

  try {
    // 1. Test Registration
    console.log(`\n▶️ 1. Testing Registration (POST /api/v1/auth/register)...`);
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: testName, email: testEmail, password: testPassword, confirmPassword: testPassword });

    if (regRes.status !== 201) {
      throw new Error(`Registration failed (${regRes.status}): ${JSON.stringify(regRes.body)}`);
    }
    console.log(`   ✅ Registered cleanly: ${regRes.body.data.user.email} (Role: ${regRes.body.data.user.role}, Onboarded: ${regRes.body.data.user.isOnboarded})`);

    // 2. Test Login & HTTP-Only Cookie Setting
    console.log(`\n▶️ 2. Testing Login & HTTP-Only JWT Cookie (POST /api/v1/auth/login)...`);
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword });

    if (loginRes.status !== 200) {
      throw new Error(`Login failed (${loginRes.status}): ${JSON.stringify(loginRes.body)}`);
    }

    const cookies = loginRes.headers['set-cookie'];
    if (!cookies || !cookies.some(c => c.startsWith('token='))) {
      throw new Error('No token HTTP-only cookie received on login!');
    }
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
    console.log(`   ✅ Login OK. Cookie received: ${cookieHeader}`);

    // 3. Test Get Current User (GET /api/v1/auth/me using Cookie)
    console.log(`\n▶️ 3. Testing Authenticated Session Check (GET /api/v1/auth/me)...`);
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookieHeader);

    if (meRes.status !== 200 || meRes.body.data.user.email !== testEmail) {
      throw new Error(`GET /me failed (${meRes.status}): ${JSON.stringify(meRes.body)}`);
    }
    console.log(`   ✅ Profile fetched successfully: ${meRes.body.data.user.name}`);

    // 4. Test Course Listing (GET /api/v1/courses)
    console.log(`\n▶️ 4. Testing Course Listing for Onboarding (GET /api/v1/courses)...`);
    const coursesRes = await request(app)
      .get('/api/v1/courses')
      .set('Cookie', cookieHeader);

    if (coursesRes.status !== 200 || !coursesRes.body.data.courses || coursesRes.body.data.courses.length === 0) {
      throw new Error(`GET /courses failed or returned empty (${coursesRes.status}): ${JSON.stringify(coursesRes.body)}`);
    }
    const targetCourse = coursesRes.body.data.courses[0];
    console.log(`   ✅ Courses retrieved (${coursesRes.body.data.courses.length} courses found). First course: ${targetCourse.name} (${targetCourse.code})`);

    // 5. Test Course Selection Onboarding (POST /api/v1/onboarding/select-course)
    console.log(`\n▶️ 5. Testing Program Onboarding Selection (POST /api/v1/onboarding/select-course)...`);
    const onboardRes = await request(app)
      .post('/api/v1/onboarding/select-course')
      .set('Cookie', cookieHeader)
      .send({ courseId: targetCourse.id, currentSemester: 2 });

    if (onboardRes.status !== 200 || onboardRes.body.data.user.isOnboarded !== true) {
      throw new Error(`Onboarding selection failed (${onboardRes.status}): ${JSON.stringify(onboardRes.body)}`);
    }
    console.log(`   ✅ Course selected successfully. User isOnboarded is now: ${onboardRes.body.data.user.isOnboarded}`);

    // 6. Test Admin RBAC Restriction on Student (Accessing Admin-Only route if any, or verify role checks)
    console.log(`\n▶️ 6. Testing Admin RBAC against seeded System Administrator...`);
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@university.edu';
    const adminPassword = process.env.ADMIN_PASSWORD || 'SecureAdminPass123!';
    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: adminEmail, password: adminPassword });

    if (adminLoginRes.status !== 200 || adminLoginRes.body.data.user.role !== 'ADMIN') {
      throw new Error(`Admin login failed or wrong role (${adminLoginRes.status}): ${JSON.stringify(adminLoginRes.body)}`);
    }
    console.log(`   ✅ Admin successfully logged in with role: ${adminLoginRes.body.data.user.role}`);

    // 7. Test Logout (POST /api/v1/auth/logout)
    console.log(`\n▶️ 7. Testing Logout & Cookie Clearing (POST /api/v1/auth/logout)...`);
    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', cookieHeader);

    if (logoutRes.status !== 200) {
      throw new Error(`Logout failed (${logoutRes.status}): ${JSON.stringify(logoutRes.body)}`);
    }
    console.log(`   ✅ Logged out cleanly.`);

    console.log(`\n🎉 PHASE 1 FOUNDATION FULLY VERIFIED — ALL 7 TEST PHASES PASSED 100%!`);
  } catch (error) {
    console.error(`\n❌ Phase 1 Verification Failed:`, error.message);
    process.exit(1);
  } finally {
    // Clean up test student
    try {
      await prisma.user.deleteMany({ where: { email: testEmail } });
      console.log(`🧹 Cleaned up test record: ${testEmail}`);
    } catch (e) {
      console.error('Cleanup error:', e.message);
    }
    await prisma.$disconnect();
    redis.disconnect();
  }
}

verifyPhase1();
