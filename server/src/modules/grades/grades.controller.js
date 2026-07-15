const prisma = require('../../config/db');
const responseHelper = require('../../utils/responseHelper');
const { getGradePoints } = require('../../utils/gradeMap');
const { calculateSGPA, calculateCGPA } = require('./gradeEngine');

/**
 * Helper to compute semester SGPAs and total CGPA from a student's grades list
 */
const computeSGPAsAndCGPA = async (studentId, preloadedGrades = null) => {
  const grades = preloadedGrades || await prisma.grade.findMany({
    where: { studentId },
    include: { subject: true },
    orderBy: [{ semesterNo: 'asc' }, { subject: { name: 'asc' } }],
  });

  // Group grades by semesterNo
  const gradesBySem = {};
  for (const g of grades) {
    if (!gradesBySem[g.semesterNo]) {
      gradesBySem[g.semesterNo] = [];
    }
    gradesBySem[g.semesterNo].push(g);
  }

  const semesterSGPAs = {};
  const semestersForCGPA = [];

  for (const [semNo, semGrades] of Object.entries(gradesBySem)) {
    const sgpa = calculateSGPA(semGrades);
    semesterSGPAs[semNo] = sgpa;

    // Calculate total credits for valid credit subjects in this semester
    let totalSemCredits = 0;
    for (const g of semGrades) {
      if (g.subject?.creditHours > 0) {
        totalSemCredits += g.subject.creditHours;
      }
    }

    if (totalSemCredits > 0) {
      semestersForCGPA.push({ sgpa, totalCredits: totalSemCredits });
    }
  }

  const cgpa = calculateCGPA(semestersForCGPA);

  return { grades, semesterSGPAs, cgpa };
};

/**
 * Get current student's grades (all semesters along with SGPA per sem and CGPA)
 * GET /api/v1/grades/me
 */
const getMyGrades = async (req, res) => {
  const studentId = req.user.id;
  const { grades, semesterSGPAs, cgpa } = await computeSGPAsAndCGPA(studentId);

  return responseHelper.success(
    res,
    { grades, semesterSGPAs, cgpa },
    'Grades retrieved successfully',
    200
  );
};

/**
 * Enter or update a grade for a subject in a semester (Student)
 * POST /api/v1/grades
 */
const upsertMyGrade = async (req, res) => {
  const studentId = req.user.id;
  const { subjectId, semesterNo, letterGrade } = req.body;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    return responseHelper.error(res, 'Subject not found', 404, 'SUBJECT_NOT_FOUND');
  }

  const gradePoints = getGradePoints(letterGrade);

  const grade = await prisma.grade.upsert({
    where: {
      studentId_subjectId_semesterNo: {
        studentId,
        subjectId,
        semesterNo,
      },
    },
    create: {
      studentId,
      subjectId,
      semesterNo,
      letterGrade,
      gradePoints,
    },
    update: {
      letterGrade,
      gradePoints,
    },
    include: { subject: true },
  });

  const { semesterSGPAs, cgpa } = await computeSGPAsAndCGPA(studentId);

  return responseHelper.success(
    res,
    { grade, semesterSGPAs, cgpa },
    'Grade saved successfully',
    200
  );
};

/**
 * Get current student's SGPA per semester
 * GET /api/v1/grades/me/sgpa
 */
const getMySGPA = async (req, res) => {
  const studentId = req.user.id;
  const { semesterSGPAs } = await computeSGPAsAndCGPA(studentId);

  return responseHelper.success(
    res,
    { semesterSGPAs },
    'SGPA calculated successfully',
    200
  );
};

/**
 * Get current student's CGPA
 * GET /api/v1/grades/me/cgpa
 */
const getMyCGPA = async (req, res) => {
  const studentId = req.user.id;
  const { cgpa } = await computeSGPAsAndCGPA(studentId);

  return responseHelper.success(
    res,
    { cgpa },
    'CGPA calculated successfully',
    200
  );
};

/**
 * Admin view of any student's grades + SGPA/CGPA
 * GET /api/v1/grades/student/:id
 */
const getStudentGrades = async (req, res) => {
  const { id: studentId } = req.params;

  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    return responseHelper.error(res, 'Student not found', 404, 'STUDENT_NOT_FOUND');
  }

  const { grades, semesterSGPAs, cgpa } = await computeSGPAsAndCGPA(studentId);

  return responseHelper.success(
    res,
    { student: { id: student.id, name: student.name, email: student.email }, grades, semesterSGPAs, cgpa },
    'Student grades retrieved successfully',
    200
  );
};

/**
 * Admin edit of a specific grade record by ID
 * PATCH /api/v1/grades/:id
 */
const updateGrade = async (req, res) => {
  const { id } = req.params;
  const { letterGrade, gradePoints } = req.body;

  const existingGrade = await prisma.grade.findUnique({
    where: { id },
  });

  if (!existingGrade) {
    return responseHelper.error(res, 'Grade record not found', 404, 'GRADE_NOT_FOUND');
  }

  let points = gradePoints !== undefined ? gradePoints : existingGrade.gradePoints;
  if (letterGrade) {
    points = getGradePoints(letterGrade);
  }

  const updatedGrade = await prisma.grade.update({
    where: { id },
    data: {
      ...(letterGrade && { letterGrade }),
      gradePoints: points,
    },
    include: { subject: true },
  });

  const { semesterSGPAs, cgpa } = await computeSGPAsAndCGPA(existingGrade.studentId);

  return responseHelper.success(
    res,
    { grade: updatedGrade, semesterSGPAs, cgpa },
    'Grade record updated successfully',
    200
  );
};

module.exports = {
  getMyGrades,
  upsertMyGrade,
  getMySGPA,
  getMyCGPA,
  getStudentGrades,
  updateGrade,
  computeSGPAsAndCGPA,
};
