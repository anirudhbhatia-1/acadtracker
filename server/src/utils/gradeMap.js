/**
 * 10-point scale grade mapping per university standards
 * Excluded/Failed/Zero credit handling integrated into calculation engine
 */
const GRADE_POINTS = {
  O: 10,
  A_PLUS: 9,
  A: 8,
  B_PLUS: 7,
  B: 6,
  C: 5,
  D: 4,
  F: 0,
};

/**
 * Helper to get grade points for a letter grade
 * @param {string} letterGrade
 * @returns {number}
 */
const getGradePoints = (letterGrade) => {
  if (GRADE_POINTS.hasOwnProperty(letterGrade)) {
    return GRADE_POINTS[letterGrade];
  }
  return 0;
};

module.exports = {
  GRADE_POINTS,
  getGradePoints,
};
