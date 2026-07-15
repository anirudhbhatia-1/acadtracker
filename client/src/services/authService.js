import api from './api';

const authService = {
  /**
   * Log in user with credentials
   * @param {string} email
   * @param {string} password
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Register new student
   * @param {string} name
   * @param {string} email
   * @param {string} password
   */
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  /**
   * Log out current user and clear cookie
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Get current user profile
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Update profile name or password
   * @param {Object} data - { name?: string, password?: string }
   */
  updateProfile: async (data) => {
    const response = await api.patch('/auth/me', data);
    return response.data;
  },
};

export default authService;
