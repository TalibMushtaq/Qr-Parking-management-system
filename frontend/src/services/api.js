import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  verify: () => api.get('/auth/verify')
};

// Parking API
export const parkingAPI = {
  getSlots: () => api.get('/parking/slots'),
  getBooking: () => api.get('/parking/booking'),
  bookSlot: (slotId, vehicleNumber) => api.post('/parking/book', { slotId, vehicleNumber }),
  cancelBooking: () => api.post('/parking/cancel')
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getSlots: () => api.get('/admin/slots'),
  releaseSlot: (slotId) => api.post('/admin/release', { slotId }),
  getQRCode: (slotId) => api.get(`/admin/qr/${slotId}`),
  scanQR: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post('/admin/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default api;

