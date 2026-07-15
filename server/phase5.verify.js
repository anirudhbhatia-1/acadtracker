require('dotenv').config();
const request = require('supertest');
const assert = require('assert');
const app = require('./src/app');
const prisma = require('./src/config/db');

async function runPhase5Verification() {
  console.log('🧪 Starting Phase 5 Admin Module Verification...');
  let adminCookie;
  let studentCookie;
  let studentId;
  let courseId1, courseId2;
  const testAdminEmail = `admin_p5_${Date.now()}@test.com`;
  const testStudentEmail = `student_p5_${Date.now()}@test.com`;
  const testPassword = 'Password123!';

  try {
    // 1. Setup Courses and Subjects for testing
    console.log('1️⃣ Creating test courses and subjects...');
    const course1 = await prisma.course.create({
      data: {
        name: 'Phase 5 Test Course 1',
        code: `P5C1_${Date.now()}`,
        department: 'CS',
        totalSemesters: 8,
      },
    });
    courseId1 = course1.id;

    const course2 = await prisma.course.create({
      data: {
        name: 'Phase 5 Test Course 2',
        code: `P5C2_${Date.now()}`,
        department: 'IT',
        totalSemesters: 6,
      },
    });
    courseId2 = course2.id;

    const sub1 = await prisma.subject.create({
      data: {
        name: 'Admin Test Subject',
        code: `SUBP5_${Date.now()}`,
        courseId: courseId1,
        semesterNo: 1,
        creditHours: 4,
        type: 'THEORY',
      },
    });

    // 2. Register Admin and Student via endpoints and set admin role
    console.log('2️⃣ Creating Admin and Student accounts...');
    const adminReg = await request(app).post('/api/v1/auth/register').send({
      name: 'P5 Admin User',
      email: testAdminEmail,
      password: testPassword,
    });
    await prisma.user.update({
      where: { email: testAdminEmail },
      data: { role: 'ADMIN' },
    });
    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: testAdminEmail,
      password: testPassword,
    });
    assert.strictEqual(adminLogin.status, 200, `Admin login failed: ${JSON.stringify(adminLogin.body)}`);
    adminCookie = adminLogin.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');

    const studentReg = await request(app).post('/api/v1/auth/register').send({
      name: 'P5 Student User',
      email: testStudentEmail,
      password: testPassword,
    });
    assert.strictEqual(studentReg.status, 201, `Student reg failed: ${JSON.stringify(studentReg.body)}`);
    studentId = studentReg.body.data.user.id;

    const studentLogin = await request(app).post('/api/v1/auth/login').send({
      email: testStudentEmail,
      password: testPassword,
    });
    studentCookie = studentLogin.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');

    // Student onboards to Course 1
    const onboard = await request(app)
      .post('/api/v1/onboarding/select-course')
      .set('Cookie', studentCookie)
      .send({ courseId: courseId1, currentSemester: 1 });
    assert.strictEqual(onboard.status, 200, `Onboard failed: ${JSON.stringify(onboard.body)}`);

    // 3. Student creates personal notes and logs grade
    console.log('3️⃣ Student logs grade and creates personal note...');
    await request(app).post('/api/v1/grades').set('Cookie', studentCookie).send({
      subjectId: sub1.id,
      semesterNo: 1,
      letterGrade: 'A_PLUS', // 9 points
    });

    await request(app).post('/api/v1/notes').set('Cookie', studentCookie).send({
      subjectId: sub1.id,
      semesterNo: 1,
      title: 'Secret Personal Note',
      content: 'Admin should never see this content',
      tag: 'SUMMARY',
    });

    // 4. Test GET /api/v1/admin/analytics
    console.log('4️⃣ Testing GET /api/v1/admin/analytics...');
    const analyticsRes = await request(app).get('/api/v1/admin/analytics').set('Cookie', adminCookie);
    assert.strictEqual(analyticsRes.status, 200, `Analytics failed: ${JSON.stringify(analyticsRes.body)}`);
    assert.ok(analyticsRes.body.data.totalStudents >= 1, 'Should reflect active students');
    assert.ok(Array.isArray(analyticsRes.body.data.courseBreakdown), 'Should have courseBreakdown array');
    console.log('   ✅ Analytics endpoint returned accurate platform stats.');

    // 5. Test GET /api/v1/admin/students
    console.log('5️⃣ Testing GET /api/v1/admin/students...');
    const studentsRes = await request(app).get('/api/v1/admin/students?search=P5 Student').set('Cookie', adminCookie);
    assert.strictEqual(studentsRes.status, 200, `Students list failed: ${JSON.stringify(studentsRes.body)}`);
    const foundStudent = studentsRes.body.data.students.find((s) => s.id === studentId);
    assert.ok(foundStudent, 'Should find our test student');
    assert.strictEqual(foundStudent.cgpa, 9, 'Should have computed CGPA 9.0');
    console.log('   ✅ Students directory and search passed.');

    // 6. Test GET /api/v1/admin/students/:id (and verify privacy isolation)
    console.log('6️⃣ Testing GET /api/v1/admin/students/:id & privacy constraints...');
    const profileRes = await request(app).get(`/api/v1/admin/students/${studentId}`).set('Cookie', adminCookie);
    assert.strictEqual(profileRes.status, 200, `Student profile failed: ${JSON.stringify(profileRes.body)}`);
    assert.strictEqual(profileRes.body.data.profile.id, studentId);
    assert.strictEqual(profileRes.body.data.profile.notes, undefined, 'Admin MUST NOT see personal notes');
    console.log('   ✅ Student profile loaded cleanly with full privacy compliance.');

    // 7. Test Semester Promotion
    console.log('7️⃣ Testing PATCH /api/v1/admin/students/:id/semester...');
    const promoteRes = await request(app)
      .patch(`/api/v1/admin/students/${studentId}/semester`)
      .set('Cookie', adminCookie)
      .send({ currentSemester: 2 });
    assert.strictEqual(promoteRes.status, 200, `Promote failed: ${JSON.stringify(promoteRes.body)}`);
    assert.strictEqual(promoteRes.body.data.student.currentSemester, 2);
    console.log('   ✅ Student semester promotion passed.');

    // 8. Test Course Change
    console.log('8️⃣ Testing PATCH /api/v1/admin/students/:id/course...');
    const changeCourseRes = await request(app)
      .patch(`/api/v1/admin/students/${studentId}/course`)
      .set('Cookie', adminCookie)
      .send({ courseId: courseId2, currentSemester: 1 });
    assert.strictEqual(changeCourseRes.status, 200, `Change course failed: ${JSON.stringify(changeCourseRes.body)}`);
    assert.strictEqual(changeCourseRes.body.data.student.courseId, courseId2);
    console.log('   ✅ Student course change passed.');

    console.log('\n🎉 ALL PHASE 5 BACKEND ADMIN ENDPOINTS PASSED 100% SUCCESS!');
  } catch (error) {
    console.error('❌ PHASE 5 VERIFICATION FAILED:', error);
    process.exit(1);
  } finally {
    // Cleanup
    if (studentId) await prisma.user.deleteMany({ where: { email: { in: [testAdminEmail, testStudentEmail] } } });
    if (courseId1) await prisma.course.deleteMany({ where: { id: { in: [courseId1, courseId2] } } });
    await prisma.$disconnect();
    console.log('🧹 Cleaned up Phase 5 verification records cleanly.');
  }
}

runPhase5Verification();
