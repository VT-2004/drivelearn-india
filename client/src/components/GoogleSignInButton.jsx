import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { googleAuth } from '../services/api';

const GoogleSignInButton = ({ onError }) => {
  const buttonRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const initGoogle = () => {
      if (!window.google || !window.google.accounts || !buttonRef.current) return false;

      try {
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
        return true;
      } catch (e) {
        console.error('Google button render error:', e);
        return false;
      }
    };

    if (!initGoogle()) {
      const interval = setInterval(() => {
        if (initGoogle()) {
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [login, navigate, onError]);

  return <div ref={buttonRef} style={{ display: 'flex', justifyContent: 'center', minHeight: '44px' }} />;
};

export default GoogleSignInButton;