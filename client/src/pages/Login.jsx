import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Login Page Component
 * Allows developers to authenticate, stores token in storage,
 * and redirects to the swiping deck on success.
 */
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // 1. Form States
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // 2. Alert & loading indicators
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { email, password } = formData;

  /**
   * Syncs input fields with local state.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error if it exists
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    // Clear general api errors
    if (apiError) {
      setApiError('');
    }
  };

  /**
   * Performs form field validation checks.
   */
  const validateForm = () => {
    const newErrors = {};

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submit trigger, sending details to context login method.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError('');

    // Trigger API check
    const result = await login(email, password);

    if (result.success) {
      // Redirect successfully authenticated users to swipe deck
      navigate('/');
    } else {
      setApiError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container my-5 py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6 col-xl-5">
          <div className="glass-panel p-4 p-md-5">
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-2">Welcome Back</h2>
              <p className="text-secondary">Log in to find your developer match</p>
            </div>

            {/* Error alerts banner */}
            {apiError && (
              <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-danger rounded-3 p-3 mb-4" role="alert">
                <span className="fw-semibold">{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email field */}
              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold small" htmlFor="loginEmailInput">Email Address</label>
                <input
                  type="email"
                  className={`form-control bg-dark border-secondary text-white p-3 rounded-3 ${errors.email ? 'is-invalid border-danger' : ''}`}
                  id="loginEmailInput"
                  name="email"
                  placeholder="developer@example.com"
                  value={email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.email && <div className="invalid-feedback fw-semibold mt-1">{errors.email}</div>}
              </div>

              {/* Password field */}
              <div className="mb-4">
                <label className="form-label text-secondary fw-semibold small" htmlFor="loginPasswordInput">Password</label>
                <input
                  type="password"
                  className={`form-control bg-dark border-secondary text-white p-3 rounded-3 ${errors.password ? 'is-invalid border-danger' : ''}`}
                  id="loginPasswordInput"
                  name="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.password && <div className="invalid-feedback fw-semibold mt-1">{errors.password}</div>}
              </div>

              {/* Submit button with loader feedback */}
              <button
                type="submit"
                className="btn btn-primary-gradient w-100 py-3 rounded-3 d-flex align-items-center justify-content-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-secondary small">Don't have an account? </span>
              <Link to="/register" className="text-primary fw-semibold small text-decoration-none hover-underline">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
