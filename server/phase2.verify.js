require('dotenv').config();
const request = require('supertest');
const assert = require('assert');
const app = require('./src/app');
const prisma = require('./src/config/db');
const redis = require('./src/config/redis');

async function verifyPhase2() {
  console.log('🧪 Starting Full Phase 2 (Chunk 2) Verification against Railway PostgreSQL & Upstash Redis...');

  const testEmail = `phase2_student_${Date.now()}@university.edu`;
  const testPassword = 'Password123!';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@university.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'SecureAdminPass123!';
  const courseCode = `VERIFY_COURSE_${Date.now().toString().slice(-6)}`;

  let studentCookie, adminCookie;
  let courseId;
  let sub1Id, sub2Id, sub3Id, subAuditId; // 3 credit subjects + 1 audit subject

  try {
    // 1. Admin Login
    console.log('\n▶️ 1. Admin Login & Course Creation...');
    const adminLogin = await request(app).post('/api/v1/auth/login').send({ email: adminEmail, password: adminPassword });
    assert.strictEqual(adminLogin.status, 200, 'Admin login failed');
    adminCookie = adminLogin.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');

    const courseRes = await request(app)
      .post('/api/v1/courses')
      .set('Cookie', adminCookie)
      .send({ name: 'Verification B.Tech AI', code: courseCode, department: 'AI', totalSemesters: 8 });
    assert.strictEqual(courseRes.status, 201, `Create course failed: ${JSON.stringify(courseRes.body)}`);
    courseId = courseRes.body.data.course.id;
    console.log(`   ✅ Course created: ${courseRes.body.data.course.name} (${courseCode})`);

    // 2. Admin creates subjects for Semester 1 (Targetting 20 credits and SGPA 8.45 test case)
    console.log('\n▶️ 2. Admin creating subjects for Semester 1...');
    // We will create:
    // Sub 1: 8 credits, A_PLUS (9) -> 72 points
    // Sub 2: 8 credits, A_PLUS (9) -> 72 points
    // Sub 3: 4 credits, B_PLUS (7) -> wait, let's get exactly 169 points over 20 credits!
    // Let's check: 72 + 72 + x = 169 -> x = 25. But 25 points from 4 credits = 25/4 = 6.25 (not a letter grade).
    // Let's make subjects that directly match letter grades:
    // Sub 1 (CS101): 4 credits, A_PLUS (9) -> 36 points
    // Sub 2 (CS102): 4 credits, A_PLUS (9) -> 36 points
    // Sub 3 (CS103): 4 credits, A (8)      -> 32 points
    // Sub 4 (CS104): 4 credits, A (8)      -> 32 points
    // Sub 5 (CS105): 3 credits, A (8)      -> 24 points
    // Sub 6 (CS106): 1 credit,  A_PLUS (9) -> 9 points
    // Sub Audit:     0 credits, O (10)     -> 0 points (excluded)
    // Total credits = 20, Total points = 169. 169 / 20 = 8.45 exact!

    const subsToCreate = [
      { name: 'CS101 AI Math I', code: `${courseCode}_S1`, semesterNo: 1, creditHours: 4, type: 'THEORY', targetGrade: 'A_PLUS' },
      { name: 'CS102 Python Lab', code: `${courseCode}_S2`, semesterNo: 1, creditHours: 4, type: 'LAB', targetGrade: 'A_PLUS' },
      { name: 'CS103 Logic Design', code: `${courseCode}_S3`, semesterNo: 1, creditHours: 4, type: 'THEORY', targetGrade: 'A' },
      { name: 'CS104 Data Structures', code: `${courseCode}_S4`, semesterNo: 1, creditHours: 4, type: 'THEORY', targetGrade: 'A' },
      { name: 'CS105 Ethics', code: `${courseCode}_S5`, semesterNo: 1, creditHours: 3, type: 'ELECTIVE', targetGrade: 'A' },
      { name: 'CS106 Seminar', code: `${courseCode}_S6`, semesterNo: 1, creditHours: 1, type: 'AUDIT', targetGrade: 'A_PLUS' },
      { name: 'CS107 Audit Zero Credit', code: `${courseCode}_S7`, semesterNo: 1, creditHours: 0, type: 'AUDIT', targetGrade: 'O' },
    ];

    const createdSubjects = [];
    for (const sub of subsToCreate) {
      const sRes = await request(app)
        .post(`/api/v1/courses/${courseId}/subjects`)
        .set('Cookie', adminCookie)
        .send(sub);
      assert.strictEqual(sRes.status, 201, `Failed creating subject ${sub.code}`);
      createdSubjects.push({ id: sRes.body.data.subject.id, ...sub });
    }
    console.log(`   ✅ Created ${createdSubjects.length} subjects (including 1 zero-credit audit course).`);

    // 3. Student Register & Onboarding
    console.log('\n▶️ 3. Student Registration & Onboarding selection...');
    const studentReg = await request(app).post('/api/v1/auth/register').send({
      name: 'Phase 2 Test Student', email: testEmail, password: testPassword, confirmPassword: testPassword,
    });
    assert.strictEqual(studentReg.status, 201, 'Student reg failed');
    const studentLogin = await request(app).post('/api/v1/auth/login').send({ email: testEmail, password: testPassword });
    studentCookie = studentLogin.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');

    const onboardRes = await request(app)
      .post('/api/v1/onboarding/select-course')
      .set('Cookie', studentCookie)
      .send({ courseId, currentSemester: 1 });
    assert.strictEqual(onboardRes.status, 200, 'Student onboarding failed');
    console.log(`   ✅ Student registered and onboarded into ${courseCode} Semester 1.`);

    // 4. Test Attendance Logging & Summary Verification
    console.log('\n▶️ 4. Testing Attendance Logging and formula verification...');
    // Subject 1: Log 10 classes total, 6 attended -> 60%, CRITICAL, needs 6 classes for 75%
    const att1 = await request(app)
      .post('/api/v1/attendance/log')
      .set('Cookie', studentCookie)
      .send({ subjectId: createdSubjects[0].id, semesterNo: 1, action: 'ATTENDED', totalIncrement: 10, attendedIncrement: 6 });
    assert.strictEqual(att1.status, 200, `Att log 1 failed: ${JSON.stringify(att1.body)}`);
    assert.strictEqual(att1.body.data.attendance.summary.percentage, 60.0);
    assert.strictEqual(att1.body.data.attendance.summary.status, 'CRITICAL');
    assert.strictEqual(att1.body.data.attendance.summary.classesNeededFor75, 6);

    // Subject 2: Log 20 classes total, 18 attended -> 90%, SAFE, can miss 4 classes
    const att2 = await request(app)
      .post('/api/v1/attendance/log')
      .set('Cookie', studentCookie)
      .send({ subjectId: createdSubjects[1].id, semesterNo: 1, action: 'ATTENDED', totalIncrement: 20, attendedIncrement: 18 });
    assert.strictEqual(att2.body.data.attendance.summary.percentage, 90.0);
    assert.strictEqual(att2.body.data.attendance.summary.status, 'SAFE');
    assert.strictEqual(att2.body.data.attendance.summary.classesCanMiss, 4);
    console.log('   ✅ Attendance logged cleanly. Formulas (percentage, SAFE/CRITICAL, classesNeededFor75, classesCanMiss) verified 100% accurate!');

    // 5. Test Grades Entry and SGPA = 8.45 verification
    console.log('\n▶️ 5. Testing Student Grades Entry and SGPA = 8.45 calculation...');
    for (const sub of createdSubjects) {
      const gRes = await request(app)
        .post('/api/v1/grades')
        .set('Cookie', studentCookie)
        .send({ subjectId: sub.id, semesterNo: 1, letterGrade: sub.targetGrade });
      assert.strictEqual(gRes.status, 200, `Grade entry failed for ${sub.code}`);
    }

    // Check GET /api/v1/grades/me/sgpa
    const sgpaRes = await request(app).get('/api/v1/grades/me/sgpa').set('Cookie', studentCookie);
    assert.strictEqual(sgpaRes.status, 200);
    const calculatedSGPA = sgpaRes.body.data.semesterSGPAs['1'];
    assert.strictEqual(calculatedSGPA, 8.45, `Expected Semester 1 SGPA to be exactly 8.45, but got ${calculatedSGPA}`);
    console.log(`   ✅ Semester 1 SGPA computed automatically as exactly ${calculatedSGPA} (verified against 8.45 requirement, excluding 0-credit subject)!`);

    // Check GET /api/v1/grades/me/cgpa
    const cgpaRes = await request(app).get('/api/v1/grades/me/cgpa').set('Cookie', studentCookie);
    assert.strictEqual(cgpaRes.status, 200);
    assert.strictEqual(cgpaRes.body.data.cgpa, 8.45, `Expected initial CGPA to match SGPA 8.45, got ${cgpaRes.body.data.cgpa}`);
    console.log(`   ✅ Initial CGPA computed: ${cgpaRes.body.data.cgpa}`);

    // 6. Test Admin viewing and updating student grades & attendance
    console.log('\n▶️ 6. Testing Admin viewing and updating student records...');
    const studentUser = await prisma.user.findUnique({ where: { email: testEmail } });
    const adminViewGrades = await request(app).get(`/api/v1/grades/student/${studentUser.id}`).set('Cookie', adminCookie);
    assert.strictEqual(adminViewGrades.status, 200);
    assert.strictEqual(adminViewGrades.body.data.semesterSGPAs['1'], 8.45);

    const adminViewAtt = await request(app).get(`/api/v1/attendance/student/${studentUser.id}`).set('Cookie', adminCookie);
    assert.strictEqual(adminViewAtt.status, 200);
    assert.strictEqual(adminViewAtt.body.data.attendance.length, 2);
    console.log(`   ✅ Admin successfully retrieved student grades (${adminViewGrades.body.data.grades.length} grades) and attendance (${adminViewAtt.body.data.attendance.length} records).`);

    console.log('\n🎉 ALL PHASE 2 BACKEND REST API ENDPOINTS & FORMULAS PASSED 100% SUCCESS!');
  } catch (error) {
    console.error('\n❌ Phase 2 Verification Failed:', error.message);
    process.exit(1);
  } finally {
    // Cleanup
    try {
      if (courseId) {
        await prisma.course.delete({ where: { id: courseId } });
      }
      await prisma.user.deleteMany({ where: { email: testEmail } });
      console.log('\n🧹 Cleaned up verification records cleanly.');
    } catch (e) {
      console.error('Cleanup error:', e.message);
    }
    await prisma.$disconnect();
    redis.disconnect();
  }
}

verifyPhase2();
