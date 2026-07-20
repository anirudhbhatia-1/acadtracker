import api from './api';

const scheduleService = {
  /**
   * Get current student's class schedules, optionally filtered by semesterNo
   * @param {number|string} [semesterNo]
   */
  getMySchedule: async (semesterNo) => {
    const params = semesterNo ? { semesterNo } : {};
    const response = await api.get('/schedule/me', { params });
    return response.data;
  },

  /**
   * Save / replace class schedule for a subject + semester
   * @param {Object} data - { subjectId, semesterNo, daysOfWeek: number[] }
   */
  saveMySchedule: async (data) => {
    const response = await api.post('/schedule/me', data);
    return response.data;
  },
};

export default scheduleService;
