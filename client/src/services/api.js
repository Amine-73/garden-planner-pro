import axios from 'axios';
import { toast } from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// --- THE INTERCEPTOR ---
API.interceptors.response.use(
  (response) => response, // If the request is successful, do nothing
  (error) => {
    // If the request fails (400, 401, 500, etc.)
    const message = error.response?.data?.message || "A network error occurred.";
    
    // Auto-show the toast
    toast.error(message);
    
    // Log for debugging
    console.error("API Error:", message);
    
    return Promise.reject(error);
  }
);

export const gardenService = {
  fetchAll: (userId) => API.get(`/api/gardens?userId=${userId}`),
  create: (payload) => API.post('/api/gardens', payload),
  delete: (id) => API.delete(`/api/gardens/${id}`),
  deleteAll: () => API.delete('/api/gardens'),
};

export const plantService = {
  fetchAll: () => API.get('/api/plants'),
};