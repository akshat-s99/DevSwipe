import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Register Page Component
 * Allows developers to create a new account, validates inputs locally,
 * integrates with the authentication context, and redirects on success.
 */
const Register = () => {
  // Access the register function from our custom authentication hook
  const { register } = useAuth();
  // Router hook to programmatically navigate to other pages
  const navigate = useNavigate();

  // 1. Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // 2. Validation & Request UI States
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deconstruct form data for easier referencing in JSX
  const { name, email, password, confirmPassword } = formData;

  /**
   * Handle user input changes.
   * Clears existing validation/API error flags when the user types.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field-specific validation error if it exists
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    // Clear general API errors on type
    if (apiError) {
      setApiError('');
    }
  };

  /**
   * Perform local frontend validation constraints.
   * Returns true if validation passes, otherwise returns false.
   */
  const validateForm = () => {
    const newErrors = {};

    // Validate Name: required and minimum 2 characters
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Validate Email: required and matches email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    // Validate Password: required and minimum 6 characters
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Validate Confirm Password: must match password field
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    // Form is valid if the errors object has no keys
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission.
   * Checks validation, triggers AuthContext, manages loading spinners, and redirects.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if local validation checks fail
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError('');

    // Trigger register API wrapper from Context Provider
    const result = await register(name, email, password);

    if (result.success) {
      // Upon successful registration and token storage, redirect to profile edit page
      navigate('/profile');
    } else {
      // On failure, display the error message returned from the server API
      setApiError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container my-5 py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6 col-xl-5">
          {/* Glassmorphic signup card panel */}
          <div className="glass-panel p-4 p-md-5">
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-2">Create Account</h2>
              <p className="text-muted">Start matching with developers around you</p>
            </div>

            {/* Error alerts banner */}
            {apiError && (
              <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-danger rounded-3 p-3 mb-4" role="alert">
                <div className="d-flex align-items-center">
                  <span className="fw-semibold">{apiError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Name field */}
              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold small" htmlFor="nameInput">Full Name</label>
                <input
                  type="text"
                  className={`form-control border p-3 rounded-3 ${errors.name ? 'is-invalid border-danger' : ''}`}
                  style={{ background: '#fff', borderColor: 'var(--surface-border)', color: 'var(--text-primary)' }}
                  id="nameInput"
                  name="name"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.name && <div className="invalid-feedback fw-semibold mt-1">{errors.name}</div>}
              </div>

              {/* Email field */}
              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold small" htmlFor="emailInput">Email Address</label>
                <input
                  type="email"
                  className={`form-control border p-3 rounded-3 ${errors.email ? 'is-invalid border-danger' : ''}`}
                  style={{ background: '#fff', borderColor: 'var(--surface-border)', color: 'var(--text-primary)' }}
                  id="emailInput"
                  name="email"
                  placeholder="e.g. developer@example.com"
                  value={email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.email && <div className="invalid-feedback fw-semibold mt-1">{errors.email}</div>}
              </div>

              {/* Password field */}
              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold small" htmlFor="passwordInput">Password</label>
                <input
                  type="password"
                  className={`form-control border p-3 rounded-3 ${errors.password ? 'is-invalid border-danger' : ''}`}
                  style={{ background: '#fff', borderColor: 'var(--surface-border)', color: 'var(--text-primary)' }}
                  id="passwordInput"
                  name="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.password && <div className="invalid-feedback fw-semibold mt-1">{errors.password}</div>}
              </div>

              {/* Confirm Password field */}
              <div className="mb-4">
                <label className="form-label text-secondary fw-semibold small" htmlFor="confirmPasswordInput">Confirm Password</label>
                <input
                  type="password"
                  className={`form-control border p-3 rounded-3 ${errors.confirmPassword ? 'is-invalid border-danger' : ''}`}
                  style={{ background: '#fff', borderColor: 'var(--surface-border)', color: 'var(--text-primary)' }}
                  id="confirmPasswordInput"
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && <div className="invalid-feedback fw-semibold mt-1">{errors.confirmPassword}</div>}
              </div>

              {/* Submit button with spinner loading feedback */}
              <button
                type="submit"
                className="btn btn-primary-gradient w-100 py-3 rounded-3 d-flex align-items-center justify-content-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Register</span>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-secondary small">Already have an account? </span>
              <Link to="/login" className="text-primary fw-semibold small text-decoration-none hover-underline">
                Login here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
