const assert = require('assert');
const { calculateSGPA, calculateCGPA } = require('../modules/grades/gradeEngine');
const { getGradePoints } = require('../utils/gradeMap');

function testGradeEngine() {
  console.log('🧪 Running Grade Engine Unit Tests...');

  // 1. Test Grade Map
  assert.strictEqual(getGradePoints('O'), 10, 'Grade point for O should be 10');
  assert.strictEqual(getGradePoints('A_PLUS'), 9, 'Grade point for A_PLUS should be 9');
  assert.strictEqual(getGradePoints('F'), 0, 'Grade point for F should be 0');

  // 2. Test calculateSGPA against confirmed test case (8.45)
  // Total points: 36 + 36 + 32 + 32 + 24 + 9 = 169 across 20 credits = 8.45
  // And we include a 0-credit subject which must be skipped!
  const testSubjects = [
    { creditHours: 4, letterGrade: 'A_PLUS' }, // 4 * 9 = 36
    { creditHours: 4, gradePoints: 9 },        // 4 * 9 = 36
    { creditHours: 4, letterGrade: 'A' },      // 4 * 8 = 32
    { creditHours: 4, gradePoints: 8 },        // 4 * 8 = 32
    { creditHours: 3, letterGrade: 'A' },      // 3 * 8 = 24
    { creditHours: 1, letterGrade: 'A_PLUS' }, // 1 * 9 = 9
    { creditHours: 0, letterGrade: 'O' },      // 0 * 10 = 0 (MUST BE EXCLUDED)
  ];

  const calculatedSGPA = calculateSGPA(testSubjects);
  console.log(`▶️ Calculated SGPA for test subjects (expected 8.45): ${calculatedSGPA}`);
  assert.strictEqual(calculatedSGPA, 8.45, `Expected SGPA 8.45 but got ${calculatedSGPA}`);
  console.log('   ✅ calculateSGPA test passed with exact 8.45 match!');

  // 3. Test calculateCGPA across semesters
  const semesters = [
    { sgpa: 8.45, totalCredits: 20 }, // 169 points
    { sgpa: 9.00, totalCredits: 22 }, // 198 points
  ];
  // Total points = 367, total credits = 42. 367 / 42 = 8.738095 -> 8.74
  const calculatedCGPA = calculateCGPA(semesters);
  console.log(`▶️ Calculated CGPA for semesters (expected 8.74): ${calculatedCGPA}`);
  assert.strictEqual(calculatedCGPA, 8.74, `Expected CGPA 8.74 but got ${calculatedCGPA}`);
  console.log('   ✅ calculateCGPA test passed cleanly!');

  console.log('🎉 ALL GRADE ENGINE UNIT TESTS PASSED!');
}

testGradeEngine();
