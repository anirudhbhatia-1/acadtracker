import api from './api';

const adminService = {
  // Analytics & Dashboard
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  getAtRiskStudents: async () => {
    const response = await api.get('/admin/at-risk');
    return response.data;
  },

  // Student Directory & Profile
  getStudents: async (params = {}) => {
    const response = await api.get('/admin/students', { params });
    return response.data;
  },

  getStudentProfile: async (studentId) => {
    const response = await api.get(`/admin/students/${studentId}`);
    return response.data;
  },

  promoteSemester: async (studentId, currentSemester) => {
    const response = await api.patch(`/admin/students/${studentId}/semester`, {
      ...(currentSemester && { currentSemester }),
    });
    return response.data;
  },

  changeCourse: async (studentId, courseId, currentSemester) => {
    const response = await api.patch(`/admin/students/${studentId}/course`, {
      courseId,
      ...(currentSemester && { currentSemester }),
    });
    return response.data;
  },

  // Course & Subject Management
  getAllCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  },

  getSubjectsByCourse: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/subjects`);
    return response.data;
  },

  createCourse: async (data) => {
    const response = await api.post('/courses', data);
    return response.data;
  },

  updateCourse: async (courseId, data) => {
    const response = await api.patch(`/courses/${courseId}`, data);
    return response.data;
  },

  deleteCourse: async (courseId) => {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
  },

  createSubject: async (courseId, data) => {
    const response = await api.post(`/courses/${courseId}/subjects`, data);
    return response.data;
  },

  updateSubject: async (subjectId, data) => {
    const response = await api.patch(`/subjects/${subjectId}`, data);
    return response.data;
  },

  deleteSubject: async (subjectId) => {
    const response = await api.delete(`/subjects/${subjectId}`);
    return response.data;
  },
};

export default adminService;
