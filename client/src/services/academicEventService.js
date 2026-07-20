import api from './api';

const academicEventService = {
  /**
   * Get academic events visible to the currently logged-in student (server-side scoped).
   */
  getStudentEvents: async () => {
    const response = await api.get('/academic-events');
    return response.data;
  },

  /**
   * Get all academic events for admin view, optionally filtered by courseId and semesterNo.
   */
  getAdminEvents: async (params = {}) => {
    const response = await api.get('/admin/academic-events', { params });
    return response.data;
  },

  /**
   * Create a new academic event (Admin only).
   */
  createEvent: async (data) => {
    const response = await api.post('/admin/academic-events', data);
    return response.data;
  },

  /**
   * Update an existing academic event (Admin only).
   */
  updateEvent: async (id, data) => {
    const response = await api.patch(`/admin/academic-events/${id}`, data);
    return response.data;
  },

  /**
   * Delete an academic event (Admin only).
   */
  deleteEvent: async (id) => {
    const response = await api.delete(`/admin/academic-events/${id}`);
    return response.data;
  },
};

export default academicEventService;
