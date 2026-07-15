import api from './api';

const subjectService = {
  /**
   * Get subjects for a course, optionally filtered by semester number
   * @param {string} courseId - ID of the course
   * @param {number} [semesterNo] - Optional semester number filter
   */
  getSubjectsByCourse: async (courseId, semesterNo) => {
    const params = {};
    if (semesterNo !== undefined && semesterNo !== null) {
      params.semester = semesterNo;
    }
    const response = await api.get(`/courses/${courseId}/subjects`, { params });
    return response.data;
  },
};

export default subjectService;
