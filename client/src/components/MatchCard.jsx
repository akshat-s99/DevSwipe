import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * MatchCard Component (Task 12.2)
 * Displays a summarized developer card in the matches list dashboard.
 * Includes GitHub link, tech tags, and a message button to open the chat.
 */
const MatchCard = ({ match }) => {
  const navigate = useNavigate();
  
  // Extract details from match prop
  const { matchId, matchedUser } = match;
  const { name, bio, githubUrl, techStack } = matchedUser;

  /**
   * Navigates to the private chat room for this specific match.
   */
  const handleOpenChat = () => {
    navigate(`/chat/${matchId}`);
  };

  return (
    <div className="col-12 col-md-6 col-lg-4 mb-4">
      {/* Glassmorphic card styling */}
      <div className="glass-panel h-100 d-flex flex-column justify-content-between p-4" style={{ borderRadius: '16px' }}>
        
        <div>
          {/* Card Header: Avatar & Name */}
          <div className="d-flex align-items-center mb-3">
            <div className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow" 
              style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                fontSize: '1.25rem'
              }}>
              {name ? name.charAt(0).toUpperCase() : 'D'}
            </div>
            
            <div className="ms-3">
              <h5 className="fw-bold mb-0 text-white text-truncate" style={{ maxWidth: '180px' }}>
                {name}
              </h5>
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary small d-flex align-items-center text-decoration-none hover-underline text-truncate"
                  style={{ maxWidth: '180px' }}
                >
                  github.com/{githubUrl.split('github.com/')[1] || 'profile'}
                </a>
              )}
            </div>
          </div>

          {/* Developer Bio */}
          <p className="text-secondary small line-clamp-3 mb-3 leading-relaxed" style={{ minHeight: '60px' }}>
            {bio || "This developer is a code artisan of few words."}
          </p>

          {/* Tech Stack tags */}
          <div className="mb-4">
            <div className="d-flex flex-wrap m-n1" style={{ maxHeight: '72px', overflow: 'hidden' }}>
              {techStack && techStack.length > 0 ? (
                techStack.map((tech) => (
                  <span key={tech} className="tech-tag py-1 px-2 m-1" style={{ fontSize: '0.75rem' }}>
                    {tech}
                  </span>
                ))
              ) : (
                <span className="text-muted small">No technologies listed.</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button: Opens chat room */}
        <button
          type="button"
          className="btn btn-primary-gradient w-100 py-2 rounded-3 fw-bold small mt-auto"
          onClick={handleOpenChat}
        >
          Message
        </button>

      </div>
    </div>
  );
};

export default MatchCard;
