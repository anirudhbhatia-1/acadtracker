/**
 * Client-side attendance summary calculation mirroring exact formulas from server/src/utils/attendanceUtils.js.
 *
 * Formulas:
 * - classesNeededFor75 = max(0, ceil(3 * totalClasses - 4 * attendedClasses))
 * - classesCanMiss = max(0, floor((4 * attendedClasses) / 3 - totalClasses))
 *
 * @param {Object} record - { totalClasses: number, attendedClasses: number }
 * @returns {Object} { percentage, status, classesNeededFor75, classesCanMiss }
 */
export const getAttendanceSummary = (record) => {
  const total = Number(record?.totalClasses || 0);
  const attended = Number(record?.attendedClasses || 0);

  let percentage = 0;
  if (total > 0) {
    percentage = Number(((attended / total) * 100).toFixed(1));
  }

  let status = 'SAFE';
  if (percentage < 70) {
    status = 'CRITICAL';
  } else if (percentage < 75) {
    status = 'WARNING';
  }

  const classesNeededFor75 = Math.max(0, Math.ceil(3 * total - 4 * attended));
  const classesCanMiss = Math.max(0, Math.floor((4 * attended) / 3 - total));

  return {
    percentage,
    status,
    classesNeededFor75,
    classesCanMiss,
  };
};

export default getAttendanceSummary;
