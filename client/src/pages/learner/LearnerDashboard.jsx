import { useAuth } from '../../context/AuthContext';

const LearnerDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: '40px' }}>
      <h1>Learner Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default LearnerDashboard;
