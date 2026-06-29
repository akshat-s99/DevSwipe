import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosConfig';
import '../styles/SwipePage.css';

const SwipePage = () => {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNextProfile();
  }, []);

  const fetchNextProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/swipe/next');
      console.log('[SwipePage] Fetched next profile:', response.data);
      setCurrentProfile(response.data);
      setLoading(false);
    } catch (err) {
      console.error('[SwipePage] Error fetching profile:', err);
      if (err.response?.status === 404) {
        setError('No more profiles available');
      } else {
        setError('Failed to load profiles');
      }
      setLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    if (!currentProfile) return;

    try {
      setLoading(true);
      console.log('[SwipePage] Swiping:', direction, 'on profile:', currentProfile._id);
      
      const response = await axiosInstance.post('/swipe', {
        swipedId: currentProfile._id,
        action: direction
      });
      
      console.log('[SwipePage] Swipe result:', response.data);
      
      // Fetch next profile after swiping
      await fetchNextProfile();
    } catch (err) {
      console.error('[SwipePage] Error swiping:', err);
      setError(err.response?.data?.error || 'Error recording swipe');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading && !currentProfile) {
    return (
      <div className="swipe-container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <span className="navbar-brand">DevSwipe</span>
          </div>
        </nav>
        <div className="swipe-content">
          <div className="text-center mt-5">
            <p>Loading profiles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !currentProfile) {
    return (
      <div className="swipe-container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <span className="navbar-brand">DevSwipe</span>
            <div className="navbar-nav ms-auto">
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </nav>
        <div className="swipe-content">
          <div className="alert alert-info mt-5">
            <h3>{error}</h3>
            <p>Come back later to see more matches!</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="swipe-container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <span className="navbar-brand">DevSwipe</span>
          </div>
        </nav>
        <div className="swipe-content">
          <div className="alert alert-warning mt-5">
            <h3>No profiles available</h3>
          </div>
        </div>
      </div>
    );
  }

  const profileName = currentProfile.userId?.name || 'Unknown';
  const profileBio = currentProfile.bio || 'No bio provided';
  const profileTechStack = currentProfile.techStack || [];

  return (
    <div className="swipe-container">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <span className="navbar-brand">DevSwipe</span>
          <div className="navbar-nav ms-auto">
            <button
              className="btn btn-outline-secondary btn-sm me-2"
              onClick={() => navigate('/matches')}
            >
              Matches
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="swipe-content">
        <div className="profile-card">
          <div className="profile-info">
            <h2>{profileName}</h2>
            <p className="text-muted">{profileBio}</p>
            {currentProfile.githubUrl && (
              <p>
                <a href={currentProfile.githubUrl} target="_blank" rel="noopener noreferrer">
                  GitHub Profile
                </a>
              </p>
            )}
            {profileTechStack.length > 0 && (
              <div className="skills">
                {profileTechStack.map((tech, idx) => (
                  <span key={idx} className="badge bg-primary">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="swipe-buttons">
          <button
            className="btn btn-lg btn-outline-danger"
            onClick={() => handleSwipe('pass')}
            disabled={loading}
          >
            Pass
          </button>
          <button
            className="btn btn-lg btn-outline-success"
            onClick={() => handleSwipe('like')}
            disabled={loading}
          >
            Like
          </button>
        </div>

        {error && (
          <div className="alert alert-warning mt-3">{error}</div>
        )}
      </div>
    </div>
  );
};

export default SwipePage;
