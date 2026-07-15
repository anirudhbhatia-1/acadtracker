import api from './api';

const predictorService = {
  simulate: async (data) => {
    const response = await api.post('/predictor/simulate', data);
    return response.data;
  },
};

export default predictorService;
