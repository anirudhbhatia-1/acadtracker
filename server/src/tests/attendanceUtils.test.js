const assert = require('assert');
const { getAttendanceSummary } = require('../utils/attendanceUtils');

function testAttendanceUtils() {
  console.log('🧪 Running Attendance Utils Unit Tests...');

  // 1. Test 60% attendance (10 total, 6 attended)
  // Needs 6 consecutive classes to hit 75% (12/16 = 75%)
  const sum1 = getAttendanceSummary({ totalClasses: 10, attendedClasses: 6 });
  assert.strictEqual(sum1.percentage, 60.0, 'Expected 60.0%');
  assert.strictEqual(sum1.status, 'CRITICAL', 'Expected CRITICAL status below 70%');
  assert.strictEqual(sum1.classesNeededFor75, 6, 'Expected 6 classes needed to reach 75%');
  assert.strictEqual(sum1.classesCanMiss, 0, 'Expected 0 classes can miss');
  console.log('   ✅ 60% test case passed (needs 6 classes to hit 75%)');

  // 2. Test exactly 75% attendance (20 total, 15 attended)
  const sum2 = getAttendanceSummary({ totalClasses: 20, attendedClasses: 15 });
  assert.strictEqual(sum2.percentage, 75.0, 'Expected 75.0%');
  assert.strictEqual(sum2.status, 'SAFE', 'Expected SAFE status');
  assert.strictEqual(sum2.classesNeededFor75, 0, 'Expected 0 needed');
  assert.strictEqual(sum2.classesCanMiss, 0, 'Expected 0 can miss right now');
  console.log('   ✅ Exactly 75% test case passed');

  // 3. Test 90% attendance (20 total, 18 attended)
  // Can miss 4 consecutive classes (18/24 = 75%)
  const sum3 = getAttendanceSummary({ totalClasses: 20, attendedClasses: 18 });
  assert.strictEqual(sum3.percentage, 90.0, 'Expected 90.0%');
  assert.strictEqual(sum3.status, 'SAFE', 'Expected SAFE status');
  assert.strictEqual(sum3.classesNeededFor75, 0, 'Expected 0 needed');
  assert.strictEqual(sum3.classesCanMiss, 4, 'Expected can miss 4 classes');
  console.log('   ✅ 90% test case passed (can miss 4 classes)');

  // 4. Test 72.5% attendance (40 total, 29 attended) -> WARNING status
  const sum4 = getAttendanceSummary({ totalClasses: 40, attendedClasses: 29 });
  assert.strictEqual(sum4.status, 'WARNING', 'Expected WARNING status between 70-75%');
  console.log('   ✅ 72.5% test case passed (WARNING status)');

  console.log('🎉 ALL ATTENDANCE UTILS UNIT TESTS PASSED!');
}

testAttendanceUtils();
