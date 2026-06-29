import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

/**
 * Swipe Page Component (Task 11.1)
 * Fetches other developers' profiles, presents them in a card layout,
 * and handles loading and empty states when no profiles are available.
 */
const Swipe = () => {
  const { user, loading: authLoading } = useAuth();

  // 1. Profile and loading states
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);

  /**
   * Fetches the next swipeable developer profile from the backend.
   */
  const fetchNextProfile = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get('/swipe/next');
      
      // The API contract returns a message when no profiles remain:
      // { message: "No more profiles available" }
      if (response.data && response.data.message) {
        setProfile(null);
        setNoMoreProfiles(true);
      } else if (response.data && response.data.userId) {
        setProfile(response.data);
        setNoMoreProfiles(false);
      } else {
        // Fallback for unexpected format
        setProfile(null);
        setNoMoreProfiles(true);
      }
    } catch (err) {
      // If we get an error response (like a 404 not found or generic server error),
      // we log it and display the error message.
      console.error('Error fetching next profile:', err);
      setError(err.response?.data?.error || 'Failed to load profiles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch the first profile upon component mounting
  useEffect(() => {
    if (user) {
      fetchNextProfile();
    }
  }, [user]);

  // Loading spinner during global user auth checks
  if (authLoading) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, prompt them to login
  if (!user) {
    return (
      <div className="container py-5 my-5 text-center">
        <div className="glass-panel p-5 d-inline-block">
          <h3 className="fw-bold mb-3">Welcome to Devify</h3>
          <p className="text-secondary mb-4">You need to be logged in to start swiping on developers.</p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/login" className="btn btn-primary-gradient px-4 py-2">
              Login
            </Link>
            <Link to="/register" className="btn btn-outline-secondary px-4 py-2 text-white">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 1. Loading state view
  if (isLoading) {
    return (
      <div className="container py-5 my-5 text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Finding developers...</span>
        </div>
        <p className="text-secondary mt-3 fw-medium">Scanning the codebase for matches...</p>
      </div>
    );
  }

  // 2. Error state view
  if (error) {
    return (
      <div className="container py-5 my-5 text-center">
        <div className="glass-panel p-5 d-inline-block" style={{ maxWidth: '500px' }}>
          <div className="text-danger mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
            </svg>
          </div>
          <h4 className="fw-bold mb-2">Connection Error</h4>
          <p className="text-secondary mb-4">{error}</p>
          <button className="btn btn-primary-gradient px-4" onClick={fetchNextProfile}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty state view: No more profiles to swipe on
  if (noMoreProfiles || !profile) {
    return (
      <div className="container py-5 my-5 text-center">
        <div className="glass-panel p-5 d-inline-block" style={{ maxWidth: '500px' }}>
          <div className="mb-4">
            <span className="display-4">🎉</span>
          </div>
          <h3 className="fw-bold mb-2">All Swiped Out!</h3>
          <p className="text-secondary mb-4">
            There are no more developers left in your area at the moment. Try updating your profile info to get noticed, or check back later!
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/profile" className="btn btn-primary-gradient px-4">
              Update Profile
            </Link>
            <button className="btn btn-outline-secondary px-4 text-white" onClick={fetchNextProfile}>
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Main Profile Card View
  return (
    <div className="container my-5 py-2">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6 col-xl-5">
          
          {/* Main Swipeable Profile Card */}
          <div className="glass-panel overflow-hidden border-secondary" style={{ borderRadius: '24px' }}>
            
            {/* Developer Card Header Decor */}
            <div className="p-4 bg-dark bg-opacity-25 border-bottom border-secondary d-flex justify-content-between align-items-center">
              <span className="small text-secondary fw-semibold">DEV MATCHING</span>
              <span className="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-3 py-1 small">
                Active Now
              </span>
            </div>

            {/* Profile Content */}
            <div className="p-4 p-md-5">
              
              {/* Profile Name & Initial Avatar */}
              <div className="d-flex align-items-center mb-4">
                <div className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-2 shadow-lg" 
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    border: '3px solid rgba(255, 255, 255, 0.1)'
                  }}>
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'D'}
                </div>
                <div className="ms-3">
                  <h3 className="fw-bold mb-1">{profile.name}</h3>
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary small d-flex align-items-center text-decoration-none hover-underline"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-github me-1" viewBox="0 0 16 16">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
                      </svg>
                      github.com/{profile.githubUrl.split('github.com/')[1] || 'profile'}
                    </a>
                  )}
                </div>
              </div>

              {/* Developer Bio */}
              <div className="mb-4">
                <h5 className="text-secondary small fw-bold text-uppercase mb-2">About Me</h5>
                <p className="text-light leading-relaxed" style={{ fontSize: '1.025rem' }}>
                  {profile.bio || "No biography provided. This developer is a code artisan of few words."}
                </p>
              </div>

              {/* Developer Tech Stack tags */}
              <div className="mb-5">
                <h5 className="text-secondary small fw-bold text-uppercase mb-2">Tech Stack</h5>
                <div className="d-flex flex-wrap m-n1" style={{ minHeight: '30px' }}>
                  {profile.techStack && profile.techStack.length > 0 ? (
                    profile.techStack.map((tech) => (
                      <span key={tech} className="tech-tag py-1 px-3 m-1">
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted small">No technologies listed.</span>
                  )}
                </div>
              </div>

              {/* Swipe Action Buttons Placeholders (Task 11.3 implementation target) */}
              <div className="d-flex justify-content-center align-items-center gap-4 mt-3 border-top border-secondary pt-4">
                <button
                  type="button"
                  className="btn btn-outline-danger d-flex align-items-center justify-content-center shadow-sm rounded-circle"
                  style={{ width: '60px', height: '60px', border: '1px solid rgba(220, 53, 69, 0.3)' }}
                  aria-label="Pass"
                  disabled
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className="btn btn-primary-gradient d-flex align-items-center justify-content-center shadow rounded-circle pulse-animation"
                  style={{ width: '70px', height: '70px' }}
                  aria-label="Like"
                  disabled
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-heart-fill" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
                  </svg>
                </button>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Swipe;
