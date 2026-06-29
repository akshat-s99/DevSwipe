/**
 * Component Template
 * 
 * This is a template for creating new reusable components in DevSwipe.
 * Copy this file and customize it for your needs.
 * 
 * Usage: Rename to your component name (e.g., UserCard.jsx)
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/ComponentName.css'; // Create corresponding CSS file

const ComponentName = ({ 
  prop1 = 'default', 
  prop2 = null, 
  onActionClick = () => {} 
}) => {
  const [state, setState] = useState('initial');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Component initialization logic
    console.log('ComponentName mounted');

    // Cleanup function
    return () => {
      console.log('ComponentName unmounted');
    };
  }, []); // Empty dependency array = runs once on mount

  const handleAction = () => {
    try {
      setLoading(true);
      // Action logic here
      onActionClick();
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="component-name-container">
      <div className="component-content">
        <h3>{prop1}</h3>
        {prop2 && <p>{prop2}</p>}
        <button 
          className="btn btn-primary"
          onClick={handleAction}
          disabled={loading}
        >
          Click Me
        </button>
      </div>
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string,
  prop2: PropTypes.string,
  onActionClick: PropTypes.func
};

export default ComponentName;
