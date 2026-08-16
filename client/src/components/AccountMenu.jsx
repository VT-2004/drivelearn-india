import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/accountMenu.css';

const roleLabels = {
  admin: 'Super Admin',
  school_owner: 'School Owner',
  instructor: 'Instructor',
  learner: 'Learner',
};

const roleLinks = {
  admin: [{ label: 'Admin Dashboard', to: '/admin' }],
  school_owner: [{ label: 'My School', to: '/school' }],
  instructor: [{ label: 'Instructor Dashboard', to: '/instructor' }],
  learner: [
    { label: 'Find Schools', to: '/learner' },
    { label: 'My Bookings', to: '/learner/bookings' },
  ],
};

const AccountMenu = ({ walletBalance }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';
  const links = roleLinks[user.role] || [];

  return (
    <div className="account-menu" ref={menuRef}>
      <button className="account-menu-trigger" onClick={() => setOpen(!open)}>
        <div className="account-avatar">{initial}</div>
        <span className="account-menu-name">{user.name}</span>
        <span className="account-menu-caret">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="account-menu-dropdown">
          <div className="account-menu-header">
            <div className="account-menu-header-name">{user.name}</div>
            <div className="account-menu-header-email">{user.email}</div>
            <span className="account-menu-header-role">{roleLabels[user.role] || user.role}</span>
          </div>

          {user.role === 'learner' && (
            <div className="account-menu-wallet">
              <span>💰 Wallet Balance</span>
              <span className="account-menu-wallet-value">
                ₹{Number(walletBalance ?? user.walletBalance ?? 0).toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {links.map((link) => (
            <Link key={link.to} to={link.to} className="account-menu-item" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}

          <Link to="/profile" className="account-menu-item" onClick={() => setOpen(false)}>
            👤 My Profile
          </Link>

          <button className="account-menu-item danger" onClick={logout}>
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;