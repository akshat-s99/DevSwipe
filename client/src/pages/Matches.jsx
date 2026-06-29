import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import MatchCard from '../components/MatchCard';

/**
 * Matches Dashboard Page Component
 * Fetches all mutual developer matches and renders them in a responsive grid.
 */
const Matches = () => {
  const { user, loading: authLoading } = useAuth();
  
  // 1. Matches list and dashboard states
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Fetches all mutual matches from /api/matches endpoint.
   */
  const fetchMatches = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get('/matches');
      // The API contract returns: { matches: [ { matchId, matchedUser, createdAt } ] }
      setMatches(response.data.matches || []);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(err.response?.data?.error || 'Failed to load matches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch matches list on component mount
  useEffect(() => {
    if (user) {
      fetchMatches();
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

  // Redirect prompt if user is unauthenticated
  if (!user) {
    return (
      <div className="container py-5 my-5 text-center">
        <div className="glass-panel p-5 d-inline-block">
          <h3 className="fw-bold mb-3">Welcome to Devify</h3>
          <p className="text-secondary mb-4">You need to be logged in to view your matches.</p>
          <Link to="/login" className="btn btn-primary-gradient px-4 py-2">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5 py-2">
      
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-5 border-bottom border-secondary pb-3">
        <div>
          <h2 className="fw-bold mb-1">Your Matches</h2>
          <p className="text-muted mb-0">Developers you matched code stacks with</p>
        </div>
        <span className="badge bg-primary bg-opacity-25 text-primary border border-primary px-3 py-2 rounded-pill fw-semibold">
          {matches.length} {matches.length === 1 ? 'Match' : 'Matches'}
        </span>
      </div>

      {/* Loading Spinner */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Fetching matches...</span>
          </div>
          <p className="text-secondary mt-3">Compiling matches list...</p>
        </div>
      ) : error ? (
        /* Error Alert banner */
        <div className="text-center py-5">
          <div className="glass-panel p-5 d-inline-block">
            <h4 className="fw-bold text-danger mb-2">Failed to Load Matches</h4>
            <p className="text-secondary mb-4">{error}</p>
            <button className="btn btn-primary-gradient px-4" onClick={fetchMatches}>
              Retry
            </button>
          </div>
        </div>
      ) : matches.length === 0 ? (
        /* Empty Dashboard state */
        <div className="text-center py-5">
          <div className="glass-panel p-5 d-inline-block" style={{ maxWidth: '500px' }}>
            <div className="mb-4">
              <span className="display-4">🔍</span>
            </div>
            <h3 className="fw-bold mb-2">No Matches Yet</h3>
            <p className="text-secondary mb-4">
              Keep swiping on other developer cards to form mutual matches! Make sure your profile stack is fully configured.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/" className="btn btn-primary-gradient px-4">
                Start Swiping
              </Link>
              <Link to="/profile" className="btn btn-outline-secondary px-4 text-white">
                Update Profile
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Grid matches list */
        <div className="row">
          {matches.map((match) => (
            <MatchCard key={match.matchId} match={match} />
          ))}
        </div>
      )}

    </div>
  );
};

export default Matches;
