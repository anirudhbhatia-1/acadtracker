import api from './api';

const noteService = {
  getMyNotes: async (params = {}) => {
    const response = await api.get('/notes/me', { params });
    return response.data;
  },
  searchNotes: async (params = {}) => {
    const response = await api.get('/notes/me/search', { params });
    return response.data;
  },
  createNote: async (data) => {
    const response = await api.post('/notes', data);
    return response.data;
  },
  updateNote: async (id, data) => {
    const response = await api.patch(`/notes/${id}`, data);
    return response.data;
  },
  deleteNote: async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },
};

export default noteService;
