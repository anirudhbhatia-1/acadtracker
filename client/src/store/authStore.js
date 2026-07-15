import { create } from 'zustand';
import authService from '../services/authService';
import courseService from '../services/courseService';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  /**
   * Check authentication session on application load
   */
  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.getMe();
      if (response && response.data && response.data.user) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Log in user with credentials
   */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(email, password);
      const user = response.data.user;
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return user;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.fields?.email ||
        'Failed to log in. Please check your credentials.';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  /**
   * Register new student and automatically log them in
   */
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(name, email, password);
      // Auto login right after registration so cookie is set and state is populated
      const loginResponse = await authService.login(email, password);
      const user = loginResponse.data.user;
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return user;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.fields?.email ||
        'Registration failed. Please try again.';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  /**
   * Log out current user
   */
  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  /**
   * Complete student onboarding course selection
   */
  selectCourse: async (courseId, currentSemester) => {
    set({ isLoading: true, error: null });
    try {
      const response = await courseService.selectCourse(courseId, currentSemester);
      const user = response.data.user;
      set({
        user,
        isLoading: false,
        error: null,
      });
      return user;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to select course.';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  /**
   * Clear error state
   */
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
