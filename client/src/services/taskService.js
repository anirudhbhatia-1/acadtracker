import api from './api';

const taskService = {
  /**
   * Get current student's tasks with optional filters
   * @param {Object} [params] - { status, priority, category, subjectId }
   */
  getMyTasks: async (params = {}) => {
    const response = await api.get('/tasks/me', { params });
    return response.data;
  },

  /**
   * Create a new task
   * @param {Object} data - { title, description, dueDate, priority, category, subjectId }
   */
  createTask: async (data) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  /**
   * Update task (status, priority, title, dueDate, description, category)
   * @param {string} id - Task ID
   * @param {Object} data - Updates
   */
  updateTask: async (id, data) => {
    const response = await api.patch(`/tasks/${id}`, data);
    return response.data;
  },

  /**
   * Delete task by ID
   * @param {string} id - Task ID
   */
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

export default taskService;
