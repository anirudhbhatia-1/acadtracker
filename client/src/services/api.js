import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not on login page, clear state/redirect if needed
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        // Optional: emit event or let store handle logout
      }
    }
    return Promise.reject(error);
  }
);

export default api;
