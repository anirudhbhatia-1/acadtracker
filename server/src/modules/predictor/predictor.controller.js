const prisma = require('../../config/db');
const responseHelper = require('../../utils/responseHelper');
const {
  calculateSGPA,
  predictCGPA,
  calculateBestCase,
  calculateWorstCase,
  calculateMinSGPANeeded,
} = require('../grades/gradeEngine');

/**
 * Run what-if CGPA simulation
 * POST /api/v1/predictor/simulate
 */
const simulateCGPA = async (req, res) => {
  const userId = req.user.id;
  const { targetCGPA, futureSemesters = [] } = req.body;

  // 1. Fetch user course and subjects
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      course: {
        include: { subjects: true },
      },
      grades: {
        include: { subject: true },
      },
    },
  });

  if (!user || !user.course) {
    return responseHelper.error(res, 'Student course enrollment not found', 400, 'COURSE_NOT_FOUND');
  }

  const totalCourseSemesters = user.course.totalSemesters || 8;
  const subjectsBySem = {};
  for (const sub of user.course.subjects) {
    if (!subjectsBySem[sub.semesterNo]) subjectsBySem[sub.semesterNo] = [];
    subjectsBySem[sub.semesterNo].push(sub);
  }

  // 2. Compute completed actual semesters
  const gradesBySem = {};
  for (const grade of user.grades) {
    if (!gradesBySem[grade.semesterNo]) gradesBySem[grade.semesterNo] = [];
    gradesBySem[grade.semesterNo].push(grade);
  }

  const actualSemesters = [];
  const completedSemNumbers = new Set();

  for (const [semNoStr, grades] of Object.entries(gradesBySem)) {
    const semNo = Number(semNoStr);
    completedSemNumbers.add(semNo);
    const sgpa = calculateSGPA(grades);

    let totalCredits = 0;
    for (const g of grades) {
      const c = Number(g.subject?.creditHours || 0);
      if (c > 0) totalCredits += c;
    }
    // If no credits recorded, sum from course subjects
    if (totalCredits === 0 && subjectsBySem[semNo]) {
      for (const s of subjectsBySem[semNo]) {
        if (s.creditHours > 0) totalCredits += s.creditHours;
      }
    }
    if (totalCredits === 0) totalCredits = 20; // Default standard credits if unassigned

    actualSemesters.push({
      semesterNo: semNo,
      sgpa,
      totalCredits,
    });
  }

  actualSemesters.sort((a, b) => a.semesterNo - b.semesterNo);
  const maxCompletedSem = actualSemesters.length > 0 ? Math.max(...actualSemesters.map((s) => s.semesterNo)) : 0;

  // 3. Determine remaining semesters
  const remainingSemestersList = [];
  let remainingTotalCredits = 0;

  for (let s = maxCompletedSem + 1; s <= totalCourseSemesters; s++) {
    let totalCredits = 0;
    if (subjectsBySem[s]) {
      for (const sub of subjectsBySem[s]) {
        if (sub.creditHours > 0) totalCredits += sub.creditHours;
      }
    }
    if (totalCredits === 0) totalCredits = 20; // Default standard credits

    remainingSemestersList.push({
      semesterNo: s,
      totalCredits,
    });
    remainingTotalCredits += totalCredits;
  }

  // 4. Build predictedSemesters from input or defaults
  const inputMap = {};
  for (const item of futureSemesters) {
    inputMap[item.semesterNo] = item;
  }

  const predictedSemesters = remainingSemestersList.map((rem) => {
    const custom = inputMap[rem.semesterNo];
    let sgpa = 8.0; // Default expected if student hasn't selected yet

    if (custom && custom.expectedGrades && custom.expectedGrades.length > 0) {
      // Enrich expected grades with credit hours from subjects if needed
      const enrichedGrades = custom.expectedGrades.map((eg) => {
        let creditHours = eg.creditHours;
        if (!creditHours && eg.subjectId && subjectsBySem[rem.semesterNo]) {
          const matchedSub = subjectsBySem[rem.semesterNo].find((su) => su.id === eg.subjectId);
          if (matchedSub) creditHours = matchedSub.creditHours;
        }
        if (!creditHours) creditHours = 4; // default
        return { ...eg, creditHours };
      });
      sgpa = calculateSGPA(enrichedGrades);
    } else if (custom && custom.sgpa !== undefined) {
      sgpa = Number(custom.sgpa);
    }

    return {
      semesterNo: rem.semesterNo,
      sgpa,
      totalCredits: custom?.totalCredits || rem.totalCredits,
    };
  });

  // 5. Run math engine functions
  const { predictedCGPA, trajectory } = predictCGPA(actualSemesters, predictedSemesters);
  const bestCaseCGPA = calculateBestCase(actualSemesters, remainingSemestersList);
  const worstCaseCGPA = calculateWorstCase(actualSemesters, remainingSemestersList);

  let minSGPANeeded = null;
  if (targetCGPA !== undefined && targetCGPA !== null) {
    minSGPANeeded = calculateMinSGPANeeded(actualSemesters, Number(targetCGPA), remainingTotalCredits);
  }

  return responseHelper.success(
    res,
    {
      predictedCGPA,
      bestCaseCGPA,
      worstCaseCGPA,
      minSGPANeeded,
      trajectory,
      actualSemesters,
      predictedSemesters,
      remainingSemesters: remainingSemestersList,
    },
    'CGPA simulation computed successfully',
    200
  );
};

module.exports = {
  simulateCGPA,
};
