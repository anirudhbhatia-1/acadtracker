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

/**
 * Calculate predicted CGPA combining completed (actual) semesters with future (predicted) semesters.
 *
 * @param {Array<Object>} actualSemesters - Array of { semesterNo: number, sgpa: number, totalCredits: number }
 * @param {Array<Object>} predictedSemesters - Array of { semesterNo: number, sgpa: number, totalCredits: number }
 * @returns {Object} { predictedCGPA: number, trajectory: Array<Object> }
 */
const predictCGPA = (actualSemesters = [], predictedSemesters = []) => {
  const actuals = actualSemesters.map((s) => ({
    semester: Number(s.semesterNo || s.semester),
    semesterNo: Number(s.semesterNo || s.semester),
    sgpa: Number(s.sgpa || 0),
    totalCredits: Number(s.totalCredits || 0),
    type: 'actual',
  }));

  const predicteds = predictedSemesters.map((s) => ({
    semester: Number(s.semesterNo || s.semester),
    semesterNo: Number(s.semesterNo || s.semester),
    sgpa: Number(s.sgpa || 0),
    totalCredits: Number(s.totalCredits || 0),
    type: 'predicted',
  }));

  const allSemesters = [...actuals, ...predicteds].sort((a, b) => a.semester - b.semester);
  const predictedCGPA = calculateCGPA(allSemesters);

  return {
    predictedCGPA,
    trajectory: allSemesters,
  };
};

/**
 * Calculate Best Case CGPA assuming all O (10 grade points) grades in remaining semesters.
 *
 * @param {Array<Object>} actualSemesters - Completed semesters { sgpa, totalCredits }
 * @param {Array<Object>} remainingSemesters - Future semesters with { totalCredits }
 * @returns {number} bestCaseCGPA rounded to 2 decimal places
 */
const calculateBestCase = (actualSemesters = [], remainingSemesters = []) => {
  let totalWeightedPoints = 0;
  let totalCredits = 0;

  for (const sem of actualSemesters) {
    const credits = Number(sem.totalCredits || 0);
    if (credits > 0) {
      totalWeightedPoints += Number(sem.sgpa || 0) * credits;
      totalCredits += credits;
    }
  }

  for (const sem of remainingSemesters) {
    const credits = Number(sem.totalCredits || 0);
    if (credits > 0) {
      totalWeightedPoints += getGradePoints('O') * credits; // O grade = 10 points
      totalCredits += credits;
    }
  }

  if (totalCredits === 0) return 0;
  return Number((totalWeightedPoints / totalCredits).toFixed(2));
};

/**
 * Calculate Worst Case CGPA assuming all D (6 grade points) grades in remaining semesters.
 *
 * @param {Array<Object>} actualSemesters - Completed semesters { sgpa, totalCredits }
 * @param {Array<Object>} remainingSemesters - Future semesters with { totalCredits }
 * @returns {number} worstCaseCGPA rounded to 2 decimal places
 */
const calculateWorstCase = (actualSemesters = [], remainingSemesters = []) => {
  let totalWeightedPoints = 0;
  let totalCredits = 0;

  for (const sem of actualSemesters) {
    const credits = Number(sem.totalCredits || 0);
    if (credits > 0) {
      totalWeightedPoints += Number(sem.sgpa || 0) * credits;
      totalCredits += credits;
    }
  }

  for (const sem of remainingSemesters) {
    const credits = Number(sem.totalCredits || 0);
    if (credits > 0) {
      totalWeightedPoints += getGradePoints('D') * credits; // D grade = 6 points
      totalCredits += credits;
    }
  }

  if (totalCredits === 0) return 0;
  return Number((totalWeightedPoints / totalCredits).toFixed(2));
};

/**
 * Calculate exact minimum SGPA needed across remaining credits to reach target CGPA.
 *
 * @param {Array<Object>} actualSemesters - Completed semesters { sgpa, totalCredits }
 * @param {number} targetCGPA - Student's target overall CGPA
 * @param {number} remainingTotalCredits - Sum of credits across all remaining future semesters
 * @returns {number|null} Required average SGPA per remaining semester, or null if no remaining credits
 */
const calculateMinSGPANeeded = (actualSemesters = [], targetCGPA, remainingTotalCredits) => {
  const remCredits = Number(remainingTotalCredits || 0);
  if (remCredits <= 0) {
    return null;
  }

  let currentPoints = 0;
  let currentCredits = 0;

  for (const sem of actualSemesters) {
    const credits = Number(sem.totalCredits || 0);
    if (credits > 0) {
      currentPoints += Number(sem.sgpa || 0) * credits;
      currentCredits += credits;
    }
  }

  const totalCreditsRequired = currentCredits + remCredits;
  const totalPointsRequired = targetCGPA * totalCreditsRequired;
  const pointsNeededFromRemaining = totalPointsRequired - currentPoints;

  const minSGPA = pointsNeededFromRemaining / remCredits;
  return Number(minSGPA.toFixed(2));
};

module.exports = {
  calculateSGPA,
  calculateCGPA,
  predictCGPA,
  calculateBestCase,
  calculateWorstCase,
  calculateMinSGPANeeded,
};
