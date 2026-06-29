import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary py-3">
      <div className="container">
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
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/">
                Swipe
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/messages">
                Messages
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/profile">
                Profile
              </NavLink>
            </li>
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
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
