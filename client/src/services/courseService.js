import api from './api';

const courseService = {
  /**
   * Get all available courses
   */
  getAllCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  },

  /**
   * Select course and current semester (onboarding)
   * @param {string} courseId
   * @param {number} currentSemester
   */
  selectCourse: async (courseId, currentSemester) => {
    const response = await api.post('/onboarding/select-course', { courseId, currentSemester });
    return response.data;
  },
};

export default courseService;
