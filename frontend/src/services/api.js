import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  adminLogin: (email, password) =>
    api.post("/auth/admin/login", { email, password }),
  register: (name, email, password, vehicleNumber) =>
    api.post("/auth/register", { name, email, password, vehicleNumber }),
  verify: () => api.get("/auth/verify"),
};

// Parking API
export const parkingAPI = {
  getSlots: () => api.get("/parking/slots"),
  getBooking: () => api.get("/parking/booking"),
  reserveSlot: (slotId, vehicleNumber) =>
    api.post("/parking/reserve", { slotId, vehicleNumber }),
  requestOccupied: () => api.post("/parking/request-occupied"),
  requestLeaving: () => api.post("/parking/request-leaving"),
  processPayment: () => api.post("/parking/payment"),
  cancelBooking: () => api.post("/parking/cancel"),
  getHistory: (params = {}) => api.get("/parking/history", { params }),
};

// Admin API
export const adminAPI = {
  // Stats
  getStats: () => api.get("/admin/stats"),

  // Parking Slots
  getSlots: () => api.get("/admin/slots"),
  updateSlotStatus: (slotId, status) =>
    api.patch(`/admin/slots/${slotId}/status`, { status }),
  releaseSlot: (slotId) => api.post(`/admin/slots/${slotId}/release`),
  getQRCode: (slotId) => api.get(`/admin/qr/${slotId}`),
  scanQR: (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    return api.post("/admin/scan", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Users
  getUsers: (params = {}) => api.get("/admin/users", { params }),
  getUser: (userId) => api.get(`/admin/users/${userId}`),
  blockUser: (userId) => api.post(`/admin/users/${userId}/block`),
  unblockUser: (userId) => api.post(`/admin/users/${userId}/unblock`),

  // Requests
  getRequests: (type) =>
    api.get("/admin/requests", { params: type ? { type } : {} }),
  approveOccupied: (slotId) => api.post(`/admin/approve-occupied/${slotId}`),
  rejectOccupied: (slotId) => api.post(`/admin/reject-occupied/${slotId}`),
  confirmPayment: (slotId) => api.post(`/admin/confirm-payment/${slotId}`),
  markPayment: (slotId) => api.post(`/admin/mark-payment/${slotId}`),
  approveLeaving: (slotId) => api.post(`/admin/approve-leaving/${slotId}`),
  resetAllRequests: () => api.post("/admin/reset-all-requests"),
  getCompletedParkings: (params = {}) =>
    api.get("/admin/completed-parkings", { params }),
};

export default api;
