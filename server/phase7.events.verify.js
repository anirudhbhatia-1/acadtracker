require('dotenv').config();
const request = require('supertest');
const assert = require('assert');
const app = require('./src/app');
const prisma = require('./src/config/db');
const redis = require('./src/config/redis');

async function verifyPhase7Events() {
  console.log('🧪 Starting Phase 7 Feature 2 (Academic Calendar Hub Scoping) Verification...');

  const ts = Date.now().toString().slice(-6);
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@university.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'SecureAdminPass123!';

  let adminCookie;
  let courseAId, courseBId;
  let studentA3Cookie, studentA4Cookie, studentBCookie;

  try {
    // 1. Admin Login & Course Creation
    console.log('\n▶️ 1. Admin Login & Course Creation...');
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: adminEmail, password: adminPassword });
    assert.strictEqual(adminLogin.status, 200, 'Admin login failed');
    adminCookie = adminLogin.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');

    // Create Course A & Course B
    const courseARes = await request(app)
      .post('/api/v1/courses')
      .set('Cookie', adminCookie)
      .send({ name: 'B.Tech Computer Science', code: `CS_${ts}`, department: 'CS', totalSemesters: 8 });
    assert.strictEqual(courseARes.status, 201, 'Failed to create Course A');
    courseAId = courseARes.body.data.course.id;

    const courseBRes = await request(app)
      .post('/api/v1/courses')
      .set('Cookie', adminCookie)
      .send({ name: 'B.Tech Electrical Eng', code: `EE_${ts}`, department: 'EE', totalSemesters: 8 });
    assert.strictEqual(courseBRes.status, 201, 'Failed to create Course B');
    courseBId = courseBRes.body.data.course.id;
    console.log(`   ✅ Created Course A (${courseAId}) and Course B (${courseBId})`);

    // Helper to register & onboard student
    async function setupStudent(email, courseId, semesterNo) {
      await request(app).post('/api/v1/auth/register').send({
        name: email.split('@')[0],
        email,
        password: 'Password123!',
      });
      const login = await request(app).post('/api/v1/auth/login').send({
        email,
        password: 'Password123!',
      });
      const cookie = login.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
      const onboard = await request(app)
        .post('/api/v1/onboarding/select-course')
        .set('Cookie', cookie)
        .send({ courseId, currentSemester: semesterNo });
      assert.strictEqual(onboard.status, 200, `Onboard failed for ${email}`);
      return cookie;
    }

    console.log('\n▶️ 2. Registering and onboarding 3 distinct test students...');
    studentA3Cookie = await setupStudent(`stud_a3_${ts}@univ.edu`, courseAId, 3);
    studentA4Cookie = await setupStudent(`stud_a4_${ts}@univ.edu`, courseAId, 4);
    studentBCookie = await setupStudent(`stud_b_${ts}@univ.edu`, courseBId, 3);
    console.log('   ✅ Student A3 (Course A, Sem 3), Student A4 (Course A, Sem 4), Student B (Course B, Sem 3) ready');

    // 3. Check 1: Event scoped to Course A, Semester 3 only
    console.log('\n▶️ 3. CHECK 1: Event scoped to Course A, Semester 3 only...');
    const evA3Res = await request(app)
      .post('/api/v1/admin/academic-events')
      .set('Cookie', adminCookie)
      .send({
        title: 'Course A Sem 3 Mid-Term Exam',
        description: 'Strictly Sem 3 CS students',
        date: new Date().toISOString(),
        type: 'EXAM',
        courseId: courseAId,
        semesterNo: 3,
      });
    assert.strictEqual(evA3Res.status, 201, `Failed to create A3 event: ${JSON.stringify(evA3Res.body)}`);
    const evA3Id = evA3Res.body.data.event.id;

    // Confirm Student A3 sees it
    const getA3_1 = await request(app).get('/api/v1/academic-events').set('Cookie', studentA3Cookie);
    assert.strictEqual(getA3_1.status, 200);
    assert.ok(
      getA3_1.body.data.events.some((e) => e.id === evA3Id),
      'Student A3 MUST see Course A Sem 3 event'
    );

    // Confirm Student A4 does not see it
    const getA4_1 = await request(app).get('/api/v1/academic-events').set('Cookie', studentA4Cookie);
    assert.strictEqual(getA4_1.status, 200);
    assert.ok(
      !getA4_1.body.data.events.some((e) => e.id === evA3Id),
      'Student A4 MUST NOT see Course A Sem 3 event'
    );

    // Confirm Student B does not see it
    const getB_1 = await request(app).get('/api/v1/academic-events').set('Cookie', studentBCookie);
    assert.strictEqual(getB_1.status, 200);
    assert.ok(
      !getB_1.body.data.events.some((e) => e.id === evA3Id),
      'Student B MUST NOT see Course A Sem 3 event'
    );
    console.log('   ✅ Check 1 passed: Strict course and semester scoping confirmed.');

    // 4. Check 2: Event with no scoping at all (Global)
    console.log('\n▶️ 4. CHECK 2: Event with no scoping at all (Global null/null)...');
    const evGlobalRes = await request(app)
      .post('/api/v1/admin/academic-events')
      .set('Cookie', adminCookie)
      .send({
        title: 'University-Wide Independence Day Holiday',
        description: 'All campus offices and classes closed',
        date: new Date().toISOString(),
        type: 'HOLIDAY',
      });
    assert.strictEqual(evGlobalRes.status, 201, 'Failed to create global event');
    const evGlobalId = evGlobalRes.body.data.event.id;

    const getA3_2 = await request(app).get('/api/v1/academic-events').set('Cookie', studentA3Cookie);
    const getA4_2 = await request(app).get('/api/v1/academic-events').set('Cookie', studentA4Cookie);
    const getB_2 = await request(app).get('/api/v1/academic-events').set('Cookie', studentBCookie);

    assert.ok(getA3_2.body.data.events.some((e) => e.id === evGlobalId), 'Student A3 sees global event');
    assert.ok(getA4_2.body.data.events.some((e) => e.id === evGlobalId), 'Student A4 sees global event');
    assert.ok(getB_2.body.data.events.some((e) => e.id === evGlobalId), 'Student B sees global event');
    console.log('   ✅ Check 2 passed: Global event visible to all courses & semesters.');

    // 5. Check 3: Event scoped to Course A, no semester (Course-Wide)
    console.log('\n▶️ 5. CHECK 3: Event scoped to Course A, no semester (Course-Wide)...');
    const evCourseRes = await request(app)
      .post('/api/v1/admin/academic-events')
      .set('Cookie', adminCookie)
      .send({
        title: 'Course A Annual Tech Fest Deadline',
        description: 'All semesters in Course A',
        date: new Date().toISOString(),
        type: 'DEADLINE',
        courseId: courseAId,
      });
    assert.strictEqual(evCourseRes.status, 201, 'Failed to create course-wide event');
    const evCourseId = evCourseRes.body.data.event.id;

    const getA3_3 = await request(app).get('/api/v1/academic-events').set('Cookie', studentA3Cookie);
    const getA4_3 = await request(app).get('/api/v1/academic-events').set('Cookie', studentA4Cookie);
    const getB_3 = await request(app).get('/api/v1/academic-events').set('Cookie', studentBCookie);

    assert.ok(getA3_3.body.data.events.some((e) => e.id === evCourseId), 'Student A3 sees course-wide event');
    assert.ok(getA4_3.body.data.events.some((e) => e.id === evCourseId), 'Student A4 sees course-wide event');
    assert.ok(!getB_3.body.data.events.some((e) => e.id === evCourseId), 'Student B DOES NOT see Course A event');
    console.log('   ✅ Check 3 passed: Course-wide event visible across semesters within course, hidden from other courses.');

    // 6. Check 4: Student calling admin endpoints directly (RBAC Rejection)
    console.log('\n▶️ 6. CHECK 4: Student calling admin endpoints directly (RBAC check)...');
    const rejectCreate = await request(app)
      .post('/api/v1/admin/academic-events')
      .set('Cookie', studentA3Cookie)
      .send({ title: 'Hacked Event', date: new Date().toISOString(), type: 'OTHER' });
    assert.strictEqual(rejectCreate.status, 403, `Expected 403, got ${rejectCreate.status}`);

    const rejectUpdate = await request(app)
      .patch(`/api/v1/admin/academic-events/${evGlobalId}`)
      .set('Cookie', studentA3Cookie)
      .send({ title: 'Modified' });
    assert.strictEqual(rejectUpdate.status, 403, `Expected 403, got ${rejectUpdate.status}`);

    const rejectDelete = await request(app)
      .delete(`/api/v1/admin/academic-events/${evGlobalId}`)
      .set('Cookie', studentA3Cookie)
      .send();
    assert.strictEqual(rejectDelete.status, 403, `Expected 403, got ${rejectDelete.status}`);
    console.log('   ✅ Check 4 passed: Student directly calling admin endpoints is rejected with 403.');

    // 7. Check 5: Read-Only calendar structure and type distinctiveness check
    console.log('\n▶️ 7. CHECK 5: Verifying read-only calendar structure & payload for integration...');
    const studentEvents = getA3_3.body.data.events;
    assert.ok(studentEvents.length >= 2, 'Student should receive scoped events');
    for (const evt of studentEvents) {
      assert.ok(evt.id && evt.title && evt.date && evt.type, 'Event must have id, title, date, and type');
      assert.ok(['EXAM', 'DEADLINE', 'HOLIDAY', 'OTHER'].includes(evt.type), 'Event must have valid EventType');
      assert.strictEqual(evt.createdById, undefined, 'CreatedBy ID or mutation metadata should not leak to student');
    }
    console.log('   ✅ Check 5 passed: Events cleanly structured for read-only status-info chip rendering.');

    console.log('\n🎉 ALL 5 VERIFICATION CHECKS PASSED FOR PHASE 7 FEATURE 2 (ACADEMIC CALENDAR HUB)!');
    return true;
  } catch (err) {
    console.error('\n❌ Verification failed:', err);
    throw err;
  } finally {
    // Cleanup test data
    try {
      if (courseAId) {
        await prisma.academicEvent.deleteMany({ where: { OR: [{ courseId: courseAId }, { courseId: courseBId }, { courseId: null }] } });
        await prisma.user.deleteMany({ where: { OR: [{ courseId: courseAId }, { courseId: courseBId }] } });
        await prisma.course.delete({ where: { id: courseAId } }).catch(() => {});
        await prisma.course.delete({ where: { id: courseBId } }).catch(() => {});
      }
    } catch (e) {
      // ignore cleanup errors
    }
    await prisma.$disconnect();
    try { redis.quit(); } catch (e) {}
  }
}

verifyPhase7Events()
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
