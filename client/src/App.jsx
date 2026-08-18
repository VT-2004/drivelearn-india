import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import Home from './pages/public/Home';
import ForSchools from './pages/public/ForSchools';
import ForLearners from './pages/public/ForLearners';
import Contact from './pages/public/Contact';
import AptitudeTest from './pages/public/AptitudeTest';
import RegisterSchool from './pages/school/RegisterSchool';
import SchoolDashboard from './pages/school/SchoolDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import SearchSchools from './pages/learner/SearchSchools';
import SchoolProfile from './pages/learner/SchoolProfile';
import MyBookings from './pages/learner/MyBookings';
import AdminSchoolDetail from './pages/admin/AdminSchoolDetail';
import Profile from './pages/shared/Profile';
import Students from './pages/school/Students';
import UserDirectory from './pages/admin/UserDirectory';
import InstructorCourseDetail from './pages/instructor/InstructorCourseDetail';
import InstructorAvailability from './pages/instructor/InstructorAvailability';

// Placeholder simple components for other roles - build these out fully in later parts
import InstructorDashboard from './pages/instructor/InstructorDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/for-schools" element={<ForSchools />} />
          <Route path="/for-learners" element={<ForLearners />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/aptitude-test" element={<AptitudeTest />} />

          <Route
            path="/learner"
            element={
              <ProtectedRoute allowedRoles={['learner']}>
                <SearchSchools />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learner/bookings"
            element={
              <ProtectedRoute allowedRoles={['learner']}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learner/school/:id"
            element={
              <ProtectedRoute allowedRoles={['learner']}>
                <SchoolProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school"
            element={
              <ProtectedRoute allowedRoles={['school_owner']}>
                <SchoolDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/register"
            element={
              <ProtectedRoute allowedRoles={['school_owner']}>
                <RegisterSchool />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor"
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/course/:id"
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorCourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/availability"
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorAvailability />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/school/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSchoolDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/students"
            element={
              <ProtectedRoute allowedRoles={['school_owner']}>
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserDirectory />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
