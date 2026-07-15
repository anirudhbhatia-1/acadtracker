import api from './api';

const attendanceService = {
  /**
   * Get current student's attendance records with enriched summary formulas
   */
  getMyAttendance: async () => {
    const response = await api.get('/attendance/me');
    return response.data;
  },

  /**
   * Log attendance for a subject (ATTENDED or MISSED)
   * @param {Object} data - { subjectId, semesterNo, action: 'ATTENDED' | 'MISSED', totalIncrement, attendedIncrement }
   */
  logAttendance: async (data) => {
    const response = await api.post('/attendance/log', data);
    return response.data;
  },

  /**
   * Correct or update a specific attendance record by ID
   * @param {string} id - Attendance record ID
   * @param {Object} data - { totalClasses, attendedClasses }
   */
  updateAttendance: async (id, data) => {
    const response = await api.patch(`/attendance/${id}`, data);
    return response.data;
  },
};

export default attendanceService;
