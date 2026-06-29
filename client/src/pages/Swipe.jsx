import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

/**
 * Swipe Page Component (Task 11.3)
 * Fetches developer profiles, handles like/pass operations,
 * and launches a modal match celebration overlay when a mutual match is formed.
 */
const Swipe = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // 1. Profile and loading states
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);

  // 2. Swipe action states
  const [isSwiping, setIsSwiping] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchDetails, setMatchDetails] = useState(null);

  /**
   * Fetches the next swipeable developer profile from the backend.
   */
  const fetchNextProfile = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get('/swipe/next');
      
      if (response.data && response.data.message) {
        setProfile(null);
        setNoMoreProfiles(true);
      } else if (response.data && response.data.userId) {
        setProfile(response.data);
        setNoMoreProfiles(false);
      } else {
        setProfile(null);
        setNoMoreProfiles(true);
      }
    } catch (err) {
      console.error('Error fetching next profile:', err);
      setError(err.response?.data?.error || 'Failed to load profiles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles a swipe action (like or pass).
   * Disables buttons during API communication, sends POST payloads,
   * and triggers match displays or next card fetches based on results.
   */
  const handleSwipe = async (action) => {
    if (!profile || isSwiping) return;

    setIsSwiping(true);
    try {
      // Send POST swipe action containing target user ID and action
      const response = await api.post('/swipe', {
        swipedUserId: profile.userId,
        action
      });

      const { match, matchedUser, matchId } = response.data;

      if (match) {
        // If match occurs, populate match details and toggle the overlay modal
        setMatchDetails({
          matchId,
          matchedUser
        });
        setShowMatchModal(true);
      } else {
        // If not a match, immediately load the next profile card
        await fetchNextProfile();
      }
    } catch (err) {
      console.error('Error recording swipe:', err);
      // Even on swipe recording failure, let the user move to the next profile
      await fetchNextProfile();
    } finally {
      setIsSwiping(false);
    }
  };

  /**
   * Closes the match modal popup and proceeds to load the next swipe card.
   */
  const handleCloseMatchModal = () => {
    setShowMatchModal(false);
    setMatchDetails(null);
    fetchNextProfile();
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
            <Link to="/register" className="btn btn-outline-secondary px-4 py-2 text-dark">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 1. Loading state view
  if (isLoading && !showMatchModal) {
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
  if (error && !showMatchModal) {
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
  if ((noMoreProfiles || !profile) && !showMatchModal) {
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
            <button className="btn btn-outline-secondary px-4 text-dark" onClick={fetchNextProfile}>
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Main Profile Card View
  return (
    <div className="container my-5 py-2 position-relative">
      
      {/* 5. MATCH MODAL OVERLAY CELEBRATION */}
      {showMatchModal && matchDetails && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
          style={{
            zIndex: 1050,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.5s ease-in-out'
          }}>
          
          <div className="glass-panel p-5 text-center max-width-match-box" style={{ maxWidth: '480px', border: '1.5px solid rgba(16, 185, 129, 0.4)' }}>
            <h1 className="display-5 fw-extrabold text-transparent bg-clip-text mb-2" style={{
              backgroundImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'Outfit'
            }}>
              It's a Match!
            </h1>
            <p className="text-secondary mb-5">You and <strong>{matchDetails.matchedUser.name}</strong> liked each other's code stack.</p>

            {/* Avatar matches comparison layout */}
            <div className="d-flex align-items-center justify-content-center gap-4 mb-5">
              
              {/* Logged in User Avatar */}
              <div className="position-relative">
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-lg" 
                  style={{
                    width: '90px',
                    height: '90px',
                    background: 'var(--primary-gradient)',
                    border: '3px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '2rem'
                  }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="position-absolute bottom-0 end-0 badge bg-primary px-2 py-1 rounded-pill small">YOU</span>
              </div>

              {/* Tick/checkmark pulse symbol */}
              <div className="pulse-animation d-flex align-items-center justify-content-center rounded-circle" style={{ width: '50px', height: '50px', background: 'rgba(16, 185, 129, 0.15)', border: '2px solid #10b981', color: '#10b981' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16">
                  <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
                </svg>
              </div>

              {/* Matched Developer Avatar */}
              <div className="position-relative">
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-lg" 
                  style={{
                    width: '90px',
                    height: '90px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: '3px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '2rem'
                  }}>
                  {matchDetails.matchedUser.name ? matchDetails.matchedUser.name.charAt(0).toUpperCase() : 'D'}
                </div>
                <span className="position-absolute bottom-0 end-0 badge px-2 py-1 rounded-pill small" style={{ background: '#10b981' }}>DEV</span>
              </div>

            </div>

            {/* Actions for matching celebration */}
            <div className="d-flex flex-column gap-3">
              <button 
                type="button" 
                className="btn btn-secondary-gradient py-3 rounded-3 fw-bold"
                onClick={() => navigate(`/chat/${matchDetails.matchId}`)}
              >
                Send Message
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary py-3 rounded-3 text-dark fw-semibold"
                onClick={handleCloseMatchModal}
                style={{ border: '1px solid var(--surface-border)' }}
              >
                Keep Swiping
              </button>
            </div>

          </div>
          
        </div>
      )}

      {/* Main card */}
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6 col-xl-5">
          
          <div className="glass-panel overflow-hidden border-secondary" style={{ borderRadius: '24px' }}>
            
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ background: 'rgba(0,0,0,0.03)', borderColor: 'var(--surface-border)' }}>
              <span className="small text-secondary fw-semibold">DEV MATCHING</span>
              <span className="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-3 py-1 small">
                Active Now
              </span>
            </div>

            <div className="p-4 p-md-5">
              
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

              <div className="mb-4">
                <h5 className="text-secondary small fw-bold text-uppercase mb-2">About Me</h5>
                <p className="text-dark leading-relaxed" style={{ fontSize: '1.025rem' }}>
                  {profile.bio || "No biography provided. This developer is a code artisan of few words."}
                </p>
              </div>

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

              {/* Swipe Action Buttons wired with click triggers and disabled states */}
              <div className="d-flex justify-content-center align-items-center gap-4 mt-3 border-top border-secondary pt-4">
                <button
                  type="button"
                  className="btn btn-outline-danger d-flex align-items-center justify-content-center shadow-sm rounded-circle swipe-btn"
                  style={{ width: '60px', height: '60px', border: '1px solid rgba(220, 53, 69, 0.3)', transition: 'all 0.2s ease' }}
                  aria-label="Pass"
                  onClick={() => handleSwipe('pass')}
                  disabled={isSwiping}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className="btn d-flex align-items-center justify-content-center shadow rounded-circle pulse-animation swipe-btn"
                  style={{ width: '70px', height: '70px', transition: 'all 0.2s ease', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', color: '#fff' }}
                  aria-label="Like"
                  onClick={() => handleSwipe('like')}
                  disabled={isSwiping}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16">
                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
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
