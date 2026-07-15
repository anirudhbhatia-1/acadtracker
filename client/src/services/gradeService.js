import api from './api';

const gradeService = {
  /**
   * Get current student's grades across all semesters along with calculated SGPA & CGPA
   */
  getMyGrades: async () => {
    const response = await api.get('/grades/me');
    return response.data;
  },

  /**
   * Enter or update a grade for a specific subject in a semester
   * @param {Object} data - { subjectId, semesterNo, letterGrade }
   */
  upsertGrade: async (data) => {
    const response = await api.post('/grades', data);
    return response.data;
  },

  /**
   * Get calculated SGPA map per semester
   */
  getMySGPA: async () => {
    const response = await api.get('/grades/me/sgpa');
    return response.data;
  },

  /**
   * Get current overall CGPA
   */
  getMyCGPA: async () => {
    const response = await api.get('/grades/me/cgpa');
    return response.data;
  },
};

export default gradeService;
