import axios from 'axios';
import { useAuthStore } from '@/store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState()?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        useAuthStore.getState()?.setAccessToken(accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState()?.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  changePassword: (data) => api.put('/auth/password', data)
};

// Vendor API
export const vendorApi = {
  getProfile: () => api.get('/vendors/profile'),
  updateProfile: (data) => api.put('/vendors/profile', data),
  updateAvatar: (formData) => api.post('/vendors/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getServices: () => api.get('/vendors/services'),
  createService: (data) => api.post('/vendors/services', data),
  updateService: (id, data) => api.put(`/vendors/services/${id}`, data),
  deleteService: (id) => api.delete(`/vendors/services/${id}`),
  getPackages: () => api.get('/vendors/packages'),
  createPackage: (data) => api.post('/vendors/packages', data),
  updatePackage: (id, data) => api.put(`/vendors/packages/${id}`, data),
  deletePackage: (id) => api.delete(`/vendors/packages/${id}`),
  getGallery: () => api.get('/vendors/gallery'),
  uploadGallery: (formData) => api.post('/vendors/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteGallery: (id) => api.delete(`/vendors/gallery/${id}`),
  getAvailability: () => api.get('/vendors/availability'),
  updateAvailability: (data) => api.put('/vendors/availability', data)
};

// Inquiry API
export const inquiryApi = {
  getAll: (params) => api.get('/inquiries', { params }),
  getById: (id) => api.get(`/inquiries/${id}`),
  create: (data) => api.post('/inquiries', data),
  update: (id, data) => api.put(`/inquiries/${id}`, data),
  updateStatus: (id, status) => api.patch(`/inquiries/${id}/status`, { status }),
  delete: (id) => api.delete(`/inquiries/${id}`),
  getStats: () => api.get('/inquiries/stats')
};

// Booking API
export const bookingApi = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  cancel: (id) => api.delete(`/bookings/${id}`)
};

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getAnalytics: () => api.get('/dashboard/analytics'),
  getRevenue: () => api.get('/dashboard/revenue'),
  getRecentActivity: () => api.get('/dashboard/recent-activity')
};

// Notification API
export const notificationApi = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};