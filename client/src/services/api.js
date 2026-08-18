import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
export const googleAuth = (credential) => api.post('/auth/google', { credential });
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/me', data);
export const changePassword = (data) => api.put('/auth/change-password', data);
export const checkEmailExists = (email) => api.post('/auth/check-email', { email });
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);

// ===== School (Owner) =====
export const registerSchool = (formData) =>
  api.post('/schools/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getMySchool = () => api.get('/schools/my-school');
export const updateSchool = (data) => api.put('/schools/my-school', data);
export const getSchoolStats = () => api.get('/schools/stats');
export const getMySchoolReviews = () => api.get('/schools/my-reviews');
export const cancelSchoolRegistration = () => api.delete('/schools/my-school');

// ===== School (Admin) =====
export const getAllSchools = (status) =>
  api.get('/schools', { params: status ? { status } : {} });
export const approveSchool = (id) => api.patch(`/schools/${id}/approve`);
export const rejectSchool = (id, reason) => api.patch(`/schools/${id}/reject`, { reason });
export const warnSchool = (id, data) => api.post(`/schools/${id}/warn`, data);
export const suspendSchool = (id, data) => api.post(`/schools/${id}/suspend`, data);
export const unsuspendSchool = (id) => api.post(`/schools/${id}/unsuspend`);
export const getSchoolNotifications = () => api.get('/schools/notifications');
export const markNotificationRead = (id) => api.patch(`/schools/notifications/${id}/read`);

// ===== Branches =====
export const addBranch = (data) => api.post('/schools/branches', data);
export const getMyBranches = () => api.get('/schools/branches');
export const deleteBranch = (id) => api.delete(`/schools/branches/${id}`);

// ===== Instructors (School Owner managing) =====
export const addInstructor = (data) => api.post('/schools/instructors', data);
export const getInstructors = () => api.get('/schools/instructors');
export const deleteInstructor = (id) => api.delete(`/schools/instructors/${id}`);

// ===== Courses (School Owner) =====
export const addCourse = (data) => api.post('/schools/courses', data);
export const getMyCourses = () => api.get('/schools/courses');
export const updateCourse = (id, data) => api.put(`/schools/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/schools/courses/${id}`);

// ===== Public (Learner Search) =====
export const searchSchools = (params) => api.get('/public/schools', { params });
export const getSchoolProfile = (id) => api.get(`/public/schools/${id}`);

// ===== Bookings =====
export const createBooking = (data) => api.post('/bookings', data);

// ===== Availability & Leave =====
export const addAvailability = (data) => api.post('/availability', data);
export const generateAvailability = (data) => api.post('/availability/generate', data);
export const generateAvailabilitySlots = (data) => api.post('/availability/generate', data);
export const getMyAvailability = () => api.get('/availability/my');
export const deleteAvailability = (id) => api.delete(`/availability/${id}`);
export const markInstructorLeave = (data) => api.post('/availability/leave', data);
export const getMyLeaves = () => api.get('/availability/leaves');
export const cancelInstructorLeave = (id) => api.delete(`/availability/leave/${id}`);
export const getAvailableSlotsForInstructor = (instructorId) => api.get(`/availability/instructor/${instructorId}`);
export const getSchoolSchedule = (params) => api.get('/availability/school', { params });
export const getMyBookings = () => api.get('/bookings/my');
export const getSchoolBookings = () => api.get('/bookings/school');
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);
export const rescheduleBooking = (id, slotId) => api.patch(`/bookings/${id}/reschedule`, { slotId });

// ===== Payments (Course Booking) =====
export const getMyPayments = () => api.get('/payments/my');
export const createBookingOrder = (bookingId) => api.post('/payments/booking/create-order', { bookingId });
export const confirmBookingWithWallet = (bookingId) => api.post('/payments/booking/confirm-wallet', { bookingId });
export const verifyBookingPayment = (data) => api.post('/payments/booking/verify', data);
export const downloadReceipt = async (bookingId) => {
  const response = await api.get(`/payments/booking/${bookingId}/receipt`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `receipt-booking-${bookingId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const downloadCertificate = async (bookingId) => {
  const response = await api.get(`/certificates/${bookingId}`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `certificate-${bookingId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// ===== Payments (School Subscription) =====
export const createSubscriptionOrder = (plan) => api.post('/payments/subscription/create-order', { plan });
export const verifySubscriptionPayment = (data) => api.post('/payments/subscription/verify', data);
export const getMySubscription = () => api.get('/payments/subscription/my');
export const adminOverrideSchoolSubscription = (schoolId, data) => api.put(`/payments/subscription/admin-override/${schoolId}`, data);

// ===== Vehicles Fleet =====
export const getVehicles = () => api.get('/vehicles');
export const addVehicle = (data) => api.post('/vehicles', data);
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);

// ===== Instructor Portal =====
export const getMyAssignedBookings = () => api.get('/instructor/bookings');
export const getInstructorCourses = () => api.get('/instructor/courses');
export const getMyWorkplace = () => api.get('/instructor/workplace');
export const getCourseStudents = (courseId, status) => api.get(`/instructor/courses/${courseId}/students`, { params: status ? { status } : {} });
export const markAttendance = (data) => api.post('/instructor/attendance', data);
export const getBookingAttendance = (bookingId) => api.get(`/instructor/attendance/${bookingId}`);
export const markBookingComplete = (id) => api.patch(`/instructor/bookings/${id}/complete`);
export const clockIn = (bookingId) => api.post('/instructor/clock-in', { bookingId });
export const clockOut = (bookingId) => api.post('/instructor/clock-out', { bookingId });
export const getInstructorCalendar = (month, year, courseId) => api.get('/instructor/calendar', { params: { month, year, courseId } });
export const getLearnerCalendar = (month, year) => api.get('/bookings/my/calendar', { params: { month, year } });

// ===== Lesson Updates (shared comments) =====
export const postUpdate = (bookingId, message) => api.post('/updates', { bookingId, message });
export const getUpdates = (bookingId) => api.get(`/updates/${bookingId}`);

// ===== Reviews =====
export const createReview = (data) => api.post('/reviews', data);
export const getReviewableSchools = () => api.get('/reviews/reviewable');

// ===== Analytics =====
export const getAdminAnalytics = () => api.get('/analytics/admin');
export const getSchoolAnalytics = () => api.get('/analytics/school');
export const getSchoolDetailForAdmin = (id) => api.get(`/analytics/admin/school/${id}`);
export const getAllUsers = (role) => api.get('/analytics/admin/users', { params: role ? { role } : {} });
export const getMyStudents = () => api.get('/schools/students');

// ===== Notifications (Generic User / Instructor / Learner) =====
export const getMyNotifications = () => api.get('/notifications');
export const markMyNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

export default api;