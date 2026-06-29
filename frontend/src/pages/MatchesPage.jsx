import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosConfig';
import '../styles/MatchesPage.css';

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/matches');
      setMatches(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load matches');
      setLoading(false);
    }
  };

  const handleChatClick = (matchId) => {
    navigate(`/chat/${matchId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="matches-container">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <span className="navbar-brand">DevSwipe - Matches</span>
          <div className="navbar-nav ms-auto">
            <button
              className="btn btn-outline-secondary btn-sm me-2"
              onClick={() => navigate('/swipe')}
            >
              Back to Swiping
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="matches-content">
        <h1 className="mb-4">Your Matches</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <p>Loading matches...</p>
        ) : matches.length === 0 ? (
          <div className="alert alert-info">
            <h5>No matches yet</h5>
            <p>Keep swiping to find your perfect match!</p>
          </div>
        ) : (
          <div className="matches-grid">
            {matches.map((match) => (
              <div key={match._id} className="match-card">
                {match.profileImage && (
                  <img
                    src={match.profileImage}
                    alt={match.name}
                    className="match-image"
                  />
                )}
                <div className="match-details">
                  <h5>{match.name}</h5>
                  <p className="text-muted small">{match.bio}</p>
                  {match.skills && (
                    <div className="skills mb-2">
                      {match.skills.slice(0, 2).map((skill, idx) => (
                        <span key={idx} className="badge bg-primary">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    className="btn btn-sm btn-primary w-100"
                    onClick={() => handleChatClick(match._id)}
                  >
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesPage;
