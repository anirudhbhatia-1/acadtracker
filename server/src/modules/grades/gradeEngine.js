const { getGradePoints } = require('../../utils/gradeMap');

/**
 * Calculate SGPA for a semester given a list of graded subject entries
 * Excludes 0-credit subjects (audit courses, non-credit pass/fail subjects) per rules.
 *
 * @param {Array<Object>} gradedSubjects - Array of { creditHours: number, gradePoints: number } or { subject: { creditHours }, letterGrade / gradePoints }
 * @returns {number} SGPA rounded to 2 decimal places
 */
const calculateSGPA = (gradedSubjects) => {
  if (!gradedSubjects || !Array.isArray(gradedSubjects) || gradedSubjects.length === 0) {
    return 0;
  }

  let totalPoints = 0;
  let totalCredits = 0;

  for (const entry of gradedSubjects) {
    const credits = Number(entry.creditHours !== undefined ? entry.creditHours : (entry.subject?.creditHours || 0));

    // Skip 0-credit subjects or invalid credit inputs
    if (credits <= 0) {
      continue;
    }

    let points = 0;
    if (entry.gradePoints !== undefined && entry.gradePoints !== null) {
      points = Number(entry.gradePoints);
    } else if (entry.letterGrade) {
      points = getGradePoints(entry.letterGrade);
    }

    totalPoints += credits * points;
    totalCredits += credits;
  }

  if (totalCredits === 0) {
    return 0;
  }

  const sgpa = totalPoints / totalCredits;
  return Number(sgpa.toFixed(2));
};

/**
 * Calculate CGPA across multiple semesters
 * Weighted average of SGPA across semesters based on total semester credits.
 *
 * @param {Array<Object>} semesters - Array of { sgpa: number, totalCredits: number }
 * @returns {number} CGPA rounded to 2 decimal places
 */
const calculateCGPA = (semesters) => {
  if (!semesters || !Array.isArray(semesters) || semesters.length === 0) {
    return 0;
  }

  let totalWeightedPoints = 0;
  let totalCumulativeCredits = 0;

  for (const sem of semesters) {
    const sgpa = Number(sem.sgpa || 0);
    const credits = Number(sem.totalCredits !== undefined ? sem.totalCredits : 1); // Fallback to unweighted if totalCredits not given

    if (credits <= 0) {
      continue;
    }

    totalWeightedPoints += sgpa * credits;
    totalCumulativeCredits += credits;
  }

  if (totalCumulativeCredits === 0) {
    return 0;
  }

  const cgpa = totalWeightedPoints / totalCumulativeCredits;
  return Number(cgpa.toFixed(2));
};

module.exports = {
  calculateSGPA,
  calculateCGPA,
};
