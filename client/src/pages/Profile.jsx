import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

/**
 * Profile Edit/Setup Page Component
 * Allows logged-in developers to manage their profile details:
 * biography, Github URL, and their technical stack tags.
 */
const Profile = () => {
  // Pull authenticated user, loading status, and user-updater from AuthContext
  const { user, loading: authLoading, setUser } = useAuth();
  const navigate = useNavigate();

  // 1. Form States
  const [bio, setBio] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [techStack, setTechStack] = useState([]);
  
  // State to hold the current string in the "Add Technology" input field
  const [newTagInput, setNewTagInput] = useState('');

  // 2. Alert & loading state indicators
  const [fieldErrors, setFieldErrors] = useState({});
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  // Redirect to login if user is not authenticated and auth loading completes
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Synchronize form states whenever the user object gets fetched or loaded
  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setGithubUrl(user.githubUrl || '');
      setTechStack(user.techStack || []);
    }
  }, [user]);

  /**
   * Handle text changes in Bio and GitHub input fields.
   * Automatically clears validation errors on modification.
   */
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    if (name === 'bio') setBio(value);
    if (name === 'githubUrl') setGithubUrl(value);

    // Clear validation error flags for this specific input
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    // Clear feedback banners
    if (feedback.message) {
      setFeedback({ type: '', message: '' });
    }
  };

  /**
   * Handles adding a new tag to the local techStack array state.
   */
  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = newTagInput.trim();

    // Check if tag input is empty
    if (!tag) return;

    // Validation: tag cannot exceed 50 characters
    if (tag.length > 50) {
      setFieldErrors((prev) => ({ ...prev, techTag: 'Technology name cannot exceed 50 characters' }));
      return;
    }

    // Validation: tag cannot be a duplicate
    if (techStack.some((existingTag) => existingTag.toLowerCase() === tag.toLowerCase())) {
      setFieldErrors((prev) => ({ ...prev, techTag: 'This technology is already in your stack' }));
      return;
    }

    // Append to local tech stack array, clear tag input, and remove errors
    setTechStack((prev) => [...prev, tag]);
    setNewTagInput('');
    setFieldErrors((prev) => ({ ...prev, techTag: '' }));
  };

  /**
   * Remove a technology tag from the local techStack array state.
   */
  const handleRemoveTag = (tagToRemove) => {
    setTechStack((prev) => prev.filter((t) => t !== tagToRemove));
  };

  /**
   * Performs form field validation checks.
   * Returns true if fields are valid, false otherwise.
   */
  const validateForm = () => {
    const errors = {};

    // Validate bio length: max 500 characters
    if (bio && bio.length > 500) {
      errors.bio = 'Bio cannot exceed 500 characters';
    }

    // Validate githubUrl: must be valid URL starting with https://github.com/
    if (githubUrl) {
      const githubPrefix = 'https://github.com/';
      if (!githubUrl.startsWith(githubPrefix)) {
        errors.githubUrl = 'GitHub URL must start with https://github.com/';
      } else {
        try {
          new URL(githubUrl);
        } catch (_) {
          errors.githubUrl = 'Please provide a valid URL';
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Submits form payload to PUT /api/profile endpoint.
   * Manages status banners and updates context states on success.
   */
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      // Send PUT request to edit developer profile details
      const response = await api.put('/profile', {
        bio,
        githubUrl,
        techStack
      });

      // Update session values inside Context API
      setUser(response.data);

      setFeedback({
        type: 'success',
        message: 'Profile saved successfully!'
      });
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: error.response?.data?.error || 'Failed to save profile. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // If AuthContext is verifying the token on load, display a premium spinner
  if (authLoading || (!user && isFetchingProfile)) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading profile...</span>
        </div>
        <p className="text-secondary mt-3">Fetching your profile details...</p>
      </div>
    );
  }

  // Double check that we have a user object loaded
  if (!user) {
    return null;
  }

  return (
    <div className="container my-5 py-2">
      <div className="row justify-content-center">
        <div className="col-md-9 col-lg-8">
          <div className="glass-panel p-4 p-md-5">
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary pb-3">
              <div>
                <h2 className="fw-bold mb-1">Developer Profile</h2>
                <p className="text-muted mb-0">Configure your portfolio details for matching</p>
              </div>
              <span className="badge bg-primary bg-opacity-25 text-primary border border-primary px-3 py-2 rounded-pill small">
                Logged in as {user.name}
              </span>
            </div>

            {/* Success/Error Alert banner */}
            {feedback.message && (
              <div
                className={`alert border-0 rounded-3 p-3 mb-4 ${
                  feedback.type === 'success'
                    ? 'alert-success bg-success bg-opacity-10 text-success'
                    : 'alert-danger bg-danger bg-opacity-10 text-danger'
                }`}
                role="alert"
              >
                <div className="fw-semibold">{feedback.message}</div>
              </div>
            )}

            <form onSubmit={handleSaveProfile} noValidate>
              {/* GitHub Portfolio URL input */}
              <div className="mb-4">
                <label className="form-label text-secondary fw-semibold small" htmlFor="githubInput">
                  GitHub Profile URL
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-github" viewBox="0 0 16 16">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
                    </svg>
                  </span>
                  <input
                    type="url"
                    className={`form-control bg-dark border-secondary text-white p-3 ${
                      fieldErrors.githubUrl ? 'is-invalid border-danger' : ''
                    }`}
                    id="githubInput"
                    name="githubUrl"
                    placeholder="https://github.com/yourusername"
                    value={githubUrl}
                    onChange={handleTextChange}
                    disabled={isSaving}
                  />
                  {fieldErrors.githubUrl && (
                    <div className="invalid-feedback fw-semibold mt-1">{fieldErrors.githubUrl}</div>
                  )}
                </div>
                <div className="form-text text-muted mt-1 small">
                  Provide your link to auto-pull repositories and showcase coding activities.
                </div>
              </div>

              {/* Developer Bio Textarea */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label text-secondary fw-semibold small mb-0" htmlFor="bioInput">
                    Professional Biography
                  </label>
                  <span className={`small fw-semibold ${bio.length > 500 ? 'text-danger' : 'text-muted'}`}>
                    {bio.length}/500
                  </span>
                </div>
                <textarea
                  className={`form-control bg-dark border-secondary text-white p-3 rounded-3 ${
                    fieldErrors.bio ? 'is-invalid border-danger' : ''
                  }`}
                  id="bioInput"
                  name="bio"
                  rows="4"
                  placeholder="Describe your coding experience, tech preferences, or projects you enjoy working on..."
                  value={bio}
                  onChange={handleTextChange}
                  disabled={isSaving}
                ></textarea>
                {fieldErrors.bio && <div className="invalid-feedback fw-semibold mt-1">{fieldErrors.bio}</div>}
              </div>

              {/* Tech Stack Badge Section */}
              <div className="mb-4">
                <label className="form-label text-secondary fw-semibold small mb-2 d-block">
                  Technical Stack Tags
                </label>

                {/* Tech Badges Container */}
                <div className="p-3 bg-dark bg-opacity-50 border border-secondary rounded-3 mb-3 d-flex flex-wrap align-items-center min-height-tag-box" style={{ minHeight: '60px' }}>
                  {techStack.length === 0 ? (
                    <span className="text-muted small px-1">No technology tags added yet. Add some below!</span>
                  ) : (
                    techStack.map((tag) => (
                      <span key={tag} className="tech-tag d-flex align-items-center py-2 px-3 m-1">
                        {tag}
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-2"
                          style={{ fontSize: '0.65rem', padding: '0.1rem' }}
                          aria-label={`Remove ${tag}`}
                          onClick={() => handleRemoveTag(tag)}
                          disabled={isSaving}
                        ></button>
                      </span>
                    ))
                  )}
                </div>

                {/* Tech tag input field and action button */}
                <div className="row g-2 align-items-start">
                  <div className="col">
                    <input
                      type="text"
                      className={`form-control bg-dark border-secondary text-white p-3 rounded-3 ${
                        fieldErrors.techTag ? 'is-invalid border-danger' : ''
                      }`}
                      placeholder="e.g. React, Node.js, Express, Docker"
                      value={newTagInput}
                      onChange={(e) => {
                        setNewTagInput(e.target.value);
                        if (fieldErrors.techTag) setFieldErrors((prev) => ({ ...prev, techTag: '' }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTag(e);
                        }
                      }}
                      disabled={isSaving}
                    />
                    {fieldErrors.techTag && (
                      <div className="invalid-feedback fw-semibold mt-1">{fieldErrors.techTag}</div>
                    )}
                  </div>
                  <div className="col-auto">
                    <button
                      type="button"
                      className="btn btn-outline-secondary p-3 rounded-3 fw-semibold text-white h-100"
                      onClick={handleAddTag}
                      disabled={isSaving}
                      style={{ border: '1px solid var(--surface-border)' }}
                    >
                      Add Tag
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit button with loader feedback */}
              <button
                type="submit"
                className="btn btn-primary-gradient w-100 py-3 rounded-3 d-flex align-items-center justify-content-center mt-5"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span>Saving profile changes...</span>
                  </>
                ) : (
                  <span>Save Profile</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
