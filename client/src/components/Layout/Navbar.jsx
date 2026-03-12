// Rewrite/client/src/components/Layout/Navbar.jsx
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCog, FaHome } from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  // const navigate = useNavigate(); // Not directly used here, but can be kept if needed later

  const handleLogout = () => {
    logout(); // AuthContext's logout should handle navigation
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          DraftIteration
        </Link>
        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} end title="Home">
              <FaHome style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Home
            </NavLink>
          </li>
          {/* "Read" and "Explore" links have been removed from here */}

          {loading ? (
            <li>Loading User...</li>
          ) : isAuthenticated && user ? (
            <>
              {user.role === 'admin' && (
                 <li>
                    <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'active' : '')} title="Admin Dashboard">
                      <FaCog style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Admin
                    </NavLink>
                 </li>
              )}
              <li>
                <NavLink
                  to={`/profile/${user.username}`}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  title="My Profile"
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <FaUser style={{ marginRight: '5px', verticalAlign: 'middle' }} /> {user.username}
                </NavLink>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-link" title="Logout">
                  <FaSignOutAlt style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/login" className={({ isActive }) => `btn btn-outline-primary btn-sm ${isActive ? 'active' : ''}`} title="Login">
                   <FaSignInAlt style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Login
                </NavLink>
              </li>
              <li>
                <NavLink to="/signup" className={({ isActive }) => `btn btn-primary btn-sm ${isActive ? 'active' : ''}`} title="Sign Up">
                   <FaUserPlus style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Sign Up
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;