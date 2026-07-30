import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

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
export const updateSchool = (data) => api.put('/schools/my-school', data);
export const getSchoolStats = () => api.get('/schools/stats');

// ===== School (Admin) =====
export const getAllSchools = (status) =>
  api.get('/schools', { params: status ? { status } : {} });
export const approveSchool = (id) => api.patch(`/schools/${id}/approve`);
export const rejectSchool = (id) => api.patch(`/schools/${id}/reject`);

// ===== Branches =====
export const addBranch = (data) => api.post('/schools/branches', data);
export const getMyBranches = () => api.get('/schools/branches');
export const deleteBranch = (id) => api.delete(`/schools/branches/${id}`);

// ===== Instructors =====
export const addInstructor = (data) => api.post('/schools/instructors', data);
export const getInstructors = () => api.get('/schools/instructors');
export const deleteInstructor = (id) => api.delete(`/schools/instructors/${id}`);

// ===== Courses (School Owner) =====
export const addCourse = (data) => api.post('/schools/courses', data);
export const getMyCourses = () => api.get('/schools/courses');
export const updateCourse = (id, data) => api.put(`/schools/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/schools/courses/${id}`);

// ===== Public (Learner Search) =====
export const searchSchools = (city) =>
  api.get('/public/schools', { params: city ? { city } : {} });
export const getSchoolProfile = (id) => api.get(`/public/schools/${id}`);

export default api;