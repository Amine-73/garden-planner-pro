import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const gardenService = {
  fetchAll: (userId) => API.get(`/api/gardens?userId=${userId}`),
  create: (payload) => API.post('/api/gardens', payload),
  delete: (id) => API.delete(`/api/gardens/${id}`),
  deleteAll: () => API.delete('/api/gardens'),
};

export const plantService = {
  fetchAll: () => API.get('/api/plants'),
};