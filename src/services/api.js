import axios from 'axios';

/**
 * Axios instance configured to communicate with Spring Boot backend.
 * In production, points to Render backend. In development, points to localhost.
 * CORS is configured on the backend to allow requests from this origin.
 */
let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Ensure /api suffix exists
if (!API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api`;
}

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor — ALWAYS use learnhub_user.id as the token.
// This is the single source of truth: whoever is logged in is in learnhub_user.
API.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('learnhub_user');
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.id) {
        config.headers.Authorization = `Bearer ${user.id}`;
        if (config.url?.includes('/registrations')) {
           console.log(`🚀 [API] Sending Registration using User ID: ${user.id} (${user.email})`);
        }
      }
    }
  } catch {
    localStorage.removeItem('learnhub_user');
  }
  return config;
});

// On 401: clear session and redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('learnhub_user');
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  requestOtp: (email) => API.post('/auth/request-otp', { email }),
};

// ==================== WEBINAR API ====================
export const webinarAPI = {
  getAll: () => API.get('/webinars'),
  getById: (id) => API.get(`/webinars/${id}`),
  create: (data) => API.post('/webinars', data),
  update: (id, data) => API.put(`/webinars/${id}`, data),
  delete: (id) => API.delete(`/webinars/${id}`),
  search: (title) => API.get(`/webinars/search?title=${encodeURIComponent(title)}`),
  getUpcoming: () => API.get('/webinars/upcoming'),
  getByCategory: (category) => API.get(`/webinars/category/${encodeURIComponent(category)}`),
  getCount: () => API.get('/webinars/count'),
  updateStatus: (id, status) => API.put(`/webinars/${id}/status?status=${encodeURIComponent(status)}`),
  getAdminWebinars: () => API.get('/admin/webinars'),
};

// ==================== REGISTRATION API ====================
export const registrationAPI = {
  register: (webinarId) => API.post(`/registrations?webinarId=${webinarId}`),
  getUserRegistrations: (id) => id ? API.get(`/registrations/user/${id}`) : API.get('/registrations/user/me'),
  getWebinarRegistrations: (webinarId) => API.get(`/registrations/webinar/${webinarId}`),
  cancel: (id) => API.delete(`/registrations/${id}`),
  cancelByWebinar: (webinarId) => API.post(`/registrations/cancel/${webinarId}`),
  markAttendance: (id) => API.put(`/registrations/${id}/attend`),
  checkRegistration: (webinarId) => API.get(`/registrations/check/${webinarId}`),
  getCount: (webinarId) => API.get(`/registrations/count/${webinarId}`),
};

// ==================== RESOURCE API ====================
export const resourceAPI = {
  add: (data) => API.post('/resources', data),
  getByWebinar: (webinarId) => API.get(`/resources/webinar/${webinarId}`),
  getById: (id) => API.get(`/resources/${id}`),
  delete: (id) => API.delete(`/resources/${id}`),
};

// ==================== USER API ====================
export const userAPI = {
  getAll: () => API.get('/users'),
  getById: (id) => API.get(`/users/${id}`),
  search: (name) => API.get(`/users/search?name=${encodeURIComponent(name)}`),
};

// ==================== RATING API ====================
export const ratingAPI = {
  submit: (data) => API.post('/ratings', data),
  getByWebinar: (webinarId) => API.get(`/ratings/webinar/${webinarId}`),
};

export default API;
