import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { googleAuth } from '../services/api';

const GoogleSignInButton = ({ onError }) => {
  const buttonRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.google || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const res = await googleAuth(response.credential);
          const { token, user } = res.data;
          login(user, token);

          const roleRoutes = {
            admin: '/admin',
            school_owner: '/school',
            instructor: '/instructor',
            learner: '/learner',
          };
          navigate(roleRoutes[user.role] || '/');
        } catch (err) {
          onError?.(err.response?.data?.error || 'Google sign-in failed');
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 340,
      text: 'continue_with',
    });
  }, [login, navigate, onError]);

  return <div ref={buttonRef} style={{ display: 'flex', justifyContent: 'center' }} />;
};

export default GoogleSignInButton;