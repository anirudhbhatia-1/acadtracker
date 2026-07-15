import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1',
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
      const url = error.config?.url || '';
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register') &&
        !url.includes('/auth/me') &&
        !url.includes('/auth/login')
      ) {
        window.location.href = '/login?expired=true';
      }
    } else if (!error.response && (error.message === 'Network Error' || error.code === 'ERR_NETWORK')) {
      toast.error('Network failure: Unable to reach server. Please retry.');
    }
    return Promise.reject(error);
  }
);

export default api;
