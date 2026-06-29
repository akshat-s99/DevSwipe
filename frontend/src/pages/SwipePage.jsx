import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosConfig';
import '../styles/SwipePage.css';

const SwipePage = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/profiles');
      setProfiles(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load profiles');
      setLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    if (currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    
    try {
      if (direction === 'like') {
        await axiosInstance.post('/swipes', {
          targetUserId: currentProfile._id,
          action: 'like'
        });
      } else {
        await axiosInstance.post('/swipes', {
          targetUserId: currentProfile._id,
          action: 'pass'
        });
      }

      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setError('No more profiles to swipe');
      }
    } catch (err) {
      setError('Error recording swipe');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="container mt-5"><p>Loading profiles...</p></div>;
  }

  if (error && profiles.length === 0) {
    return <div className="container mt-5"><p className="text-danger">{error}</p></div>;
  }

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info">
          <h3>No more profiles available</h3>
          <p>Come back later to see more matches!</p>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

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
          {currentProfile.profileImage && (
            <img
              src={currentProfile.profileImage}
              alt={currentProfile.name}
              className="profile-image"
            />
          )}
          <div className="profile-info">
            <h2>{currentProfile.name}</h2>
            <p className="text-muted">{currentProfile.bio}</p>
            {currentProfile.skills && (
              <div className="skills">
                {currentProfile.skills.map((skill, idx) => (
                  <span key={idx} className="badge bg-primary">
                    {skill}
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
          >
            Pass
          </button>
          <button
            className="btn btn-lg btn-outline-success"
            onClick={() => handleSwipe('like')}
          >
            Like
          </button>
        </div>

        {error && currentIndex < profiles.length && (
          <div className="alert alert-danger mt-3">{error}</div>
        )}

        <div className="progress-indicator mt-3">
          <small>{currentIndex + 1} / {profiles.length}</small>
        </div>
      </div>
    </div>
  );
};

export default SwipePage;
