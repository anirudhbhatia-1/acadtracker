import api from './api';

const resourceService = {
  getResources: async (params = {}) => {
    const response = await api.get('/resources', { params });
    return response.data;
  },
  createResource: async (data) => {
    const response = await api.post('/resources', data);
    return response.data;
  },
  updateResource: async (id, data) => {
    const response = await api.patch(`/resources/${id}`, data);
    return response.data;
  },
  deleteResource: async (id) => {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  },
  // Admin only pinned resource actions
  createPinnedResource: async (data) => {
    const response = await api.post('/resources/pin', data);
    return response.data;
  },
  updatePinnedResource: async (id, data) => {
    const response = await api.patch(`/resources/pin/${id}`, data);
    return response.data;
  },
  deletePinnedResource: async (id) => {
    const response = await api.delete(`/resources/pin/${id}`);
    return response.data;
  },
};

export default resourceService;
