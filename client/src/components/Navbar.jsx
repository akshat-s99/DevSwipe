import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Common Navigation Header Component
 * Dynamically adjusts buttons and link items based on developer login session states.
 */
const Navbar = () => {
  // Read auth context state and logout method
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Clears user token, closes WebSocket connection, and redirects to Login page.
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary py-3">
      <div className="container">
        {/* Brand Logo text with custom swipe gradient */}
        <Link className="navbar-brand fw-bold fs-3 text-transparent bg-clip-text" to="/" style={{
          backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Devify
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            
            {/* Always show Swipe deck */}
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/">
                Swipe
              </NavLink>
            </li>

            {/* If logged in, display Matches and Profile links */}
            {user && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/matches">
                    Matches
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/profile">
                    Profile
                  </NavLink>
                </li>
              </>
            )}

            {/* Dynamic Auth buttons */}
            {!user ? (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/login">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item ms-2">
                  <Link className="btn btn-primary-gradient px-4" to="/register">
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item ms-3">
                <button 
                  type="button" 
                  className="btn btn-outline-danger px-4 py-2 small fw-semibold" 
                  onClick={handleLogout}
                  style={{ borderRadius: '10px' }}
                >
                  Logout
                </button>
              </li>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
