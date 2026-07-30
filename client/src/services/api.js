import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach the token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== Auth =====
export const signupUser = (data) => api.post('/auth/signup', data);
export const loginUser = (data) => api.post('/auth/login', data);

// ===== School (Owner) =====
export const registerSchool = (formData) =>
  api.post('/schools/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getMySchool = () => api.get('/schools/my-school');

// ===== School (Admin) =====
export const getAllSchools = (status) =>
  api.get('/schools', { params: status ? { status } : {} });
export const approveSchool = (id) => api.patch(`/schools/${id}/approve`);
export const rejectSchool = (id) => api.patch(`/schools/${id}/reject`);

// ===== Branches =====
export const addBranch = (data) => api.post('/schools/branches', data);
export const getMyBranches = () => api.get('/schools/branches');
export const deleteBranch = (id) => api.delete(`/schools/branches/${id}`);

export default api;