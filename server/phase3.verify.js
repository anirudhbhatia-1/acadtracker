require('dotenv').config();
const request = require('supertest');
const assert = require('assert');
const app = require('./src/app');
const prisma = require('./src/config/db');
const redis = require('./src/config/redis');

async function verifyPhase3() {
  console.log('🧪 Starting Full Phase 3 (Chunk 1) Verification against Railway PostgreSQL & Upstash Redis...');

  const testEmail1 = `phase3_student1_${Date.now()}@university.edu`;
  const testEmail2 = `phase3_student2_${Date.now()}@university.edu`;
  const testPassword = 'Password123!';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@university.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'SecureAdminPass123!';
  const courseCode = `P3_COURSE_${Date.now().toString().slice(-6)}`;

  let studentCookie1, studentCookie2, adminCookie;
  let courseId;
  let taskId1, taskIdOverdue;

  try {
    // 1. Admin Login & Course Setup
    console.log('\n▶️ 1. Admin Login & Course Setup...');
    const adminLogin = await request(app).post('/api/v1/auth/login').send({ email: adminEmail, password: adminPassword });
    assert.strictEqual(adminLogin.status, 200, 'Admin login failed');
    adminCookie = adminLogin.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');

    const courseRes = await request(app)
      .post('/api/v1/courses')
      .set('Cookie', adminCookie)
      .send({ name: 'Phase 3 Verification B.Tech', code: courseCode, department: 'CS', totalSemesters: 8 });
    assert.strictEqual(courseRes.status, 201, `Create course failed: ${JSON.stringify(courseRes.body)}`);
    courseId = courseRes.body.data.course.id;

    // 2. Register & Onboard Two Students into the Course
    console.log('\n▶️ 2. Registering Two Students into the course...');
    await request(app).post('/api/v1/auth/register').send({ name: 'Student One', email: testEmail1, password: testPassword, confirmPassword: testPassword });
    const s1Login = await request(app).post('/api/v1/auth/login').send({ email: testEmail1, password: testPassword });
    studentCookie1 = s1Login.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
    await request(app).post('/api/v1/onboarding/select-course').set('Cookie', studentCookie1).send({ courseId, currentSemester: 4 });

    await request(app).post('/api/v1/auth/register').send({ name: 'Student Two', email: testEmail2, password: testPassword, confirmPassword: testPassword });
    const s2Login = await request(app).post('/api/v1/auth/login').send({ email: testEmail2, password: testPassword });
    studentCookie2 = s2Login.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
    await request(app).post('/api/v1/onboarding/select-course').set('Cookie', studentCookie2).send({ courseId, currentSemester: 4 });
    console.log('   ✅ Both students registered and onboarded.');

    // 3. Test Student Creating Tasks (Future & Overdue)
    console.log('\n▶️ 3. Student One creating tasks (Normal and Overdue)...');
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

    const t1Res = await request(app)
      .post('/api/v1/tasks')
      .set('Cookie', studentCookie1)
      .send({ title: 'Complete AI Project Submission', description: 'Build neural net model', dueDate: futureDate, priority: 'HIGH', category: 'PROJECT' });
    assert.strictEqual(t1Res.status, 201, `Failed to create task: ${JSON.stringify(t1Res.body)}`);
    taskId1 = t1Res.body.data.task.id;
    assert.strictEqual(t1Res.body.data.task.isOverdue, false, 'Future task should not be overdue');

    const tOverdueRes = await request(app)
      .post('/api/v1/tasks')
      .set('Cookie', studentCookie1)
      .send({ title: 'Overdue Homework Assignment', description: 'Should be flagged', dueDate: pastDate, priority: 'MEDIUM', category: 'ASSIGNMENT' });
    assert.strictEqual(tOverdueRes.status, 201);
    taskIdOverdue = tOverdueRes.body.data.task.id;
    assert.strictEqual(tOverdueRes.body.data.task.isOverdue, true, 'Past task should be automatically flagged as overdue');
    console.log('   ✅ Tasks created and isOverdue auto-flagging verified exactly.');

    // 4. Test Task Retrieval, Sorting, and Filtering
    console.log('\n▶️ 4. Testing Task Retrieval, Sorting by Due Date, and Query Filters...');
    const listRes = await request(app).get('/api/v1/tasks/me').set('Cookie', studentCookie1);
    assert.strictEqual(listRes.status, 200);
    assert.strictEqual(listRes.body.data.tasks.length, 2);
    // Soonest due date should come first
    assert.strictEqual(listRes.body.data.tasks[0].id, taskIdOverdue, 'Tasks should be sorted by soonest due date first');

    const filterRes = await request(app).get('/api/v1/tasks/me?priority=HIGH').set('Cookie', studentCookie1);
    assert.strictEqual(filterRes.status, 200);
    assert.strictEqual(filterRes.body.data.tasks.length, 1);
    assert.strictEqual(filterRes.body.data.tasks[0].title, 'Complete AI Project Submission');
    console.log('   ✅ Sorting by due date and filtering by priority passed.');

    // 5. Test Updating Task & Overdue Clearing on DONE status
    console.log('\n▶️ 5. Testing Task Updates & Overdue clearing when status is changed to DONE...');
    const updateRes = await request(app)
      .patch(`/api/v1/tasks/${taskIdOverdue}`)
      .set('Cookie', studentCookie1)
      .send({ status: 'DONE' });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.data.task.status, 'DONE');
    assert.strictEqual(updateRes.body.data.task.isOverdue, false, 'Completed tasks (status=DONE) must not be marked overdue even if due date is in the past');
    console.log('   ✅ Overdue flag cleared properly when task status is DONE.');

    // 6. Test Admin Broadcast Notice to all students
    console.log('\n▶️ 6. Testing Admin Broadcast Notice (`POST /api/v1/tasks/broadcast`)...\n');
    const broadcastRes = await request(app)
      .post('/api/v1/tasks/broadcast')
      .set('Cookie', adminCookie)
      .send({
        title: 'IMPORTANT: Midterm Exam Schedule Released',
        description: 'Check the portal for your exact hall tickets.',
        dueDate: futureDate,
        priority: 'HIGH',
        category: 'EXAM',
        courseId: courseId,
      });
    assert.strictEqual(broadcastRes.status, 201, `Broadcast failed: ${JSON.stringify(broadcastRes.body)}`);
    assert.strictEqual(broadcastRes.body.data.broadcastCount >= 2, true, 'Should broadcast to at least both enrolled students');

    // Verify both students received the broadcasted task
    const s1TasksAfter = await request(app).get('/api/v1/tasks/me').set('Cookie', studentCookie1);
    const s2TasksAfter = await request(app).get('/api/v1/tasks/me').set('Cookie', studentCookie2);
    const hasBroadcast1 = s1TasksAfter.body.data.tasks.some(t => t.title.includes('Midterm Exam Schedule'));
    const hasBroadcast2 = s2TasksAfter.body.data.tasks.some(t => t.title.includes('Midterm Exam Schedule'));
    assert.strictEqual(hasBroadcast1, true, 'Student 1 should receive broadcast notice');
    assert.strictEqual(hasBroadcast2, true, 'Student 2 should receive broadcast notice');
    console.log('   ✅ Broadcast notice successfully created and delivered to all enrolled students.');

    // 7. Test Deletion
    console.log('\n▶️ 7. Testing Task Deletion...');
    const deleteRes = await request(app).delete(`/api/v1/tasks/${taskId1}`).set('Cookie', studentCookie1);
    assert.strictEqual(deleteRes.status, 200);
    const checkAfterDelete = await request(app).get('/api/v1/tasks/me').set('Cookie', studentCookie1);
    assert.strictEqual(checkAfterDelete.body.data.tasks.some(t => t.id === taskId1), false);
    console.log('   ✅ Task deleted cleanly.');

    console.log('\n🎉 ALL PHASE 3 BACKEND TASKS & BROADCAST REST ENDPOINTS PASSED 100% SUCCESS!');
  } catch (error) {
    console.error('\n❌ Phase 3 Verification Failed:', error.message);
    process.exit(1);
  } finally {
    try {
      if (courseId) await prisma.course.delete({ where: { id: courseId } });
      await prisma.user.deleteMany({ where: { email: { in: [testEmail1, testEmail2] } } });
      console.log('\n🧹 Cleaned up verification records cleanly.');
    } catch (e) {
      console.error('Cleanup error:', e.message);
    }
    await prisma.$disconnect();
    redis.disconnect();
  }
}

verifyPhase3();
