import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Home from './pages/public/Home';
import ForSchools from './pages/public/ForSchools';
import ForLearners from './pages/public/ForLearners';
import Contact from './pages/public/Contact';
import RegisterSchool from './pages/school/RegisterSchool';
import SchoolDashboard from './pages/school/SchoolDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import SearchSchools from './pages/learner/SearchSchools';
import SchoolProfile from './pages/learner/SchoolProfile';
import MyBookings from './pages/learner/MyBookings';

// Placeholder simple components for other roles - build these out fully in later parts
const InstructorDashboard = () => <div style={{ padding: '40px' }}><h1>Instructor Dashboard</h1></div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/for-schools" element={<ForSchools />} />
          <Route path="/for-learners" element={<ForLearners />} />
          <Route path="/contact" element={<Contact />} />

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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
