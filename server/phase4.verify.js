require('dotenv').config();
const request = require('supertest');
const assert = require('assert');
const app = require('./src/app');
const prisma = require('./src/config/db');

async function verifyPhase4() {
  console.log('🧪 Starting Full Phase 4 (Chunk 1) Verification against Railway PostgreSQL & Upstash Redis...');

  const testEmail1 = `phase4_student1_${Date.now()}@university.edu`;
  const testEmail2 = `phase4_student2_${Date.now()}@university.edu`;
  const testPassword = 'Password123!';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@university.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'SecureAdminPass123!';
  const courseCode = `P4_COURSE_${Date.now().toString().slice(-6)}`;

  let studentCookie1, studentCookie2, adminCookie;
  let courseId, subjectIdSem1, subjectIdSem2;
  let noteId1, resourcePersonalId, resourcePinnedId;

  try {
    // 1. Admin Login & Course Setup
    console.log('\n▶️ 1. Admin Login & Course Setup...');
    const adminLogin = await request(app).post('/api/v1/auth/login').send({ email: adminEmail, password: adminPassword });
    assert.strictEqual(adminLogin.status, 200, 'Admin login failed');
    adminCookie = adminLogin.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');

    const courseRes = await request(app)
      .post('/api/v1/courses')
      .set('Cookie', adminCookie)
      .send({
        name: 'Phase 4 Engineering',
        code: courseCode,
        department: 'Computer Science',
        totalSemesters: 4,
      });
    assert.strictEqual(courseRes.status, 201, 'Course creation failed');
    courseId = courseRes.body.data.course.id;

    // Create Subject for Sem 1
    const subRes1 = await request(app)
      .post(`/api/v1/courses/${courseId}/subjects`)
      .set('Cookie', adminCookie)
      .send({
        name: 'Data Structures',
        code: 'CS201',
        courseId,
        semesterNo: 1,
        creditHours: 4,
        type: 'THEORY',
      });
    subjectIdSem1 = subRes1.body.data.subject.id;

    // Create Subject for Sem 2
    const subRes2 = await request(app)
      .post(`/api/v1/courses/${courseId}/subjects`)
      .set('Cookie', adminCookie)
      .send({
        name: 'Algorithms',
        code: 'CS202',
        courseId,
        semesterNo: 2,
        creditHours: 4,
        type: 'THEORY',
      });
    subjectIdSem2 = subRes2.body.data.subject.id;

    // 2. Register Two Students and Login
    console.log('\n▶️ 2. Registering Two Students into the course...');
    const reg1 = await request(app).post('/api/v1/auth/register').send({ name: 'Student One', email: testEmail1, password: testPassword });
    assert.strictEqual(reg1.status, 201, `reg1 failed: ${JSON.stringify(reg1.body)}`);
    const log1 = await request(app).post('/api/v1/auth/login').send({ email: testEmail1, password: testPassword });
    assert.strictEqual(log1.status, 200, `log1 failed: ${JSON.stringify(log1.body)}`);
    studentCookie1 = log1.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');

    const onboard1 = await request(app).post('/api/v1/onboarding/select-course').set('Cookie', studentCookie1).send({ courseId, currentSemester: 2 });
    assert.strictEqual(onboard1.status, 200, `onboard1 failed: ${JSON.stringify(onboard1.body)}`);

    const reg2 = await request(app).post('/api/v1/auth/register').send({ name: 'Student Two', email: testEmail2, password: testPassword });
    assert.strictEqual(reg2.status, 201, `reg2 failed: ${JSON.stringify(reg2.body)}`);
    const log2 = await request(app).post('/api/v1/auth/login').send({ email: testEmail2, password: testPassword });
    assert.strictEqual(log2.status, 200, `log2 failed: ${JSON.stringify(log2.body)}`);
    studentCookie2 = log2.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');

    const onboard2 = await request(app).post('/api/v1/onboarding/select-course').set('Cookie', studentCookie2).send({ courseId, currentSemester: 2 });
    assert.strictEqual(onboard2.status, 200, `onboard2 failed: ${JSON.stringify(onboard2.body)}`);

    // 3. Student 1 Logs Grade for Sem 1 & Tests CGPA Predictor Simulation
    console.log('\n▶️ 3. Testing CGPA Predictor Simulation (`POST /api/v1/predictor/simulate`)...');
    await request(app)
      .post('/api/v1/grades')
      .set('Cookie', studentCookie1)
      .send({ subjectId: subjectIdSem1, semesterNo: 1, letterGrade: 'O' }); // O = 10 pts

    const simRes = await request(app)
      .post('/api/v1/predictor/simulate')
      .set('Cookie', studentCookie1)
      .send({
        targetCGPA: 9.0,
        futureSemesters: [
          {
            semesterNo: 2,
            expectedGrades: [
              { subjectId: subjectIdSem2, creditHours: 4, letterGrade: 'A' }, // A = 9 pts
            ],
          },
        ],
      });

    assert.strictEqual(simRes.status, 200, 'Predictor simulation request failed');
    const simData = simRes.body.data;
    assert.ok(simData.predictedCGPA !== undefined, 'Missing predictedCGPA');
    assert.ok(simData.bestCaseCGPA !== undefined, 'Missing bestCaseCGPA');
    assert.ok(simData.worstCaseCGPA !== undefined, 'Missing worstCaseCGPA');
    assert.ok(simData.minSGPANeeded !== undefined, 'Missing minSGPANeeded');
    assert.ok(Array.isArray(simData.trajectory), 'Trajectory must be an array');
    console.log(`   ✅ Simulation Results -> Predicted: ${simData.predictedCGPA}, Best: ${simData.bestCaseCGPA}, Worst: ${simData.worstCaseCGPA}, Min SGPA Needed: ${simData.minSGPANeeded}`);

    // 4. Testing Notes CRUD & Search with Privacy Check
    console.log('\n▶️ 4. Testing Notes CRUD & Full-Text Search...');
    const noteCreate = await request(app)
      .post('/api/v1/notes')
      .set('Cookie', studentCookie1)
      .send({
        subjectId: subjectIdSem1,
        semesterNo: 1,
        title: 'Binary Trees Summary',
        content: 'Key formulas: height log2(N), AVL balance factors.',
        tag: 'SUMMARY',
      });
    assert.strictEqual(noteCreate.status, 201, 'Note creation failed');
    noteId1 = noteCreate.body.data.note.id;

    // Search Notes
    const noteSearch = await request(app)
      .get('/api/v1/notes/me/search?q=balance&tag=SUMMARY')
      .set('Cookie', studentCookie1);
    assert.strictEqual(noteSearch.status, 200);
    assert.strictEqual(noteSearch.body.data.notes.length, 1, 'Search should find note matching keyword and tag');

    // Privacy Isolation check: Student 2 tries to edit/delete Student 1's note
    const privUpdate = await request(app)
      .patch(`/api/v1/notes/${noteId1}`)
      .set('Cookie', studentCookie2)
      .send({ title: 'Hacked Title' });
    assert.strictEqual(privUpdate.status, 403, 'Student 2 must not be able to edit Student 1 note');

    // Student 1 updates note
    const noteUpdate = await request(app)
      .patch(`/api/v1/notes/${noteId1}`)
      .set('Cookie', studentCookie1)
      .send({ title: 'Binary Trees Advanced Summary' });
    assert.strictEqual(noteUpdate.status, 200);
    assert.strictEqual(noteUpdate.body.data.note.title, 'Binary Trees Advanced Summary');

    // 5. Testing Resources Module (Pinned vs Personal link)
    console.log('\n▶️ 5. Testing Resources Module (Admin Pinned vs Personal link logic)...');
    // Student 1 adds personal resource link
    const persRes = await request(app)
      .post('/api/v1/resources')
      .set('Cookie', studentCookie1)
      .send({
        subjectId: subjectIdSem1,
        semesterNo: 1,
        title: 'Personal Study Guide URL',
        url: 'https://example.com/guide',
        type: 'ARTICLE',
      });
    assert.strictEqual(persRes.status, 201);
    resourcePersonalId = persRes.body.data.resource.id;

    // Admin adds pinned resource
    const pinRes = await request(app)
      .post('/api/v1/resources/pin')
      .set('Cookie', adminCookie)
      .send({
        subjectId: subjectIdSem1,
        semesterNo: 1,
        title: 'Official Faculty Lecture Video',
        url: 'https://youtube.com/watch?v=123',
        type: 'YOUTUBE',
      });
    assert.strictEqual(pinRes.status, 201);
    resourcePinnedId = pinRes.body.data.resource.id;
    assert.strictEqual(pinRes.body.data.resource.isPinned, true, 'Admin resource must have isPinned=true');

    // Student 1 gets resources -> should see both (Pinned first, then Personal)
    const getRes1 = await request(app)
      .get(`/api/v1/resources?subjectId=${subjectIdSem1}`)
      .set('Cookie', studentCookie1);
    assert.strictEqual(getRes1.status, 200);
    assert.strictEqual(getRes1.body.data.resources.length, 2);
    assert.strictEqual(getRes1.body.data.resources[0].isPinned, true, 'Pinned resource must appear at the top');

    // Student 2 gets resources -> should ONLY see admin pinned resource (Student 1 personal link is hidden)
    const getRes2 = await request(app)
      .get(`/api/v1/resources?subjectId=${subjectIdSem1}`)
      .set('Cookie', studentCookie2);
    assert.strictEqual(getRes2.status, 200);
    assert.strictEqual(getRes2.body.data.resources.length, 1, 'Student 2 should only see pinned resource');
    assert.strictEqual(getRes2.body.data.resources[0].id, resourcePinnedId);
    console.log('   ✅ Resource pinning ordering and personal link isolation passed.');

    // Cleanup deletion tests
    await request(app).delete(`/api/v1/notes/${noteId1}`).set('Cookie', studentCookie1);
    await request(app).delete(`/api/v1/resources/${resourcePersonalId}`).set('Cookie', studentCookie1);
    await request(app).delete(`/api/v1/resources/pin/${resourcePinnedId}`).set('Cookie', adminCookie);

    console.log('\n🎉 ALL PHASE 4 BACKEND PREDICTOR, NOTES & RESOURCES REST ENDPOINTS PASSED 100% SUCCESS!');
  } catch (error) {
    console.error('\n❌ PHASE 4 VERIFICATION FAILED:', error.message);
    if (error.response) console.error('Response body:', error.response.body);
    throw error;
  } finally {
    if (courseId) {
      await prisma.course.deleteMany({ where: { id: courseId } });
      await prisma.user.deleteMany({ where: { email: { in: [testEmail1, testEmail2] } } });
      console.log('🧹 Cleaned up Phase 4 verification records cleanly.\n');
    }
  }
}

verifyPhase4()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
