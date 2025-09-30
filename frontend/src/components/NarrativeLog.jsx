import React, { useEffect, useRef } from 'react';
import '../styles/NarrativeLog.css';

const NarrativeLog = ({ narrative, worldState, recentActions }) => {
  const logRef = useRef(null);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [narrative, recentActions]);

  const formatNarrative = (text) => {
    if (!text) return '';
    
    // Split by paragraphs and format
    return text.split('\n\n').map((paragraph, index) => (
      <p key={index} className="narrative-paragraph">
        {paragraph.trim()}
      </p>
    ));
  };

  const getWorldStateDisplay = () => {
    if (!worldState || typeof worldState !== 'object') return null;

    return (
      <div className="world-state-info">
        {worldState.location && (
          <div className="world-item">
            <span className="world-icon">📍</span>
            <span className="world-text">Location: {worldState.location}</span>
          </div>
        )}
        {worldState.timeOfDay && (
          <div className="world-item">
            <span className="world-icon">🕐</span>
            <span className="world-text">{worldState.timeOfDay}</span>
          </div>
        )}
        {worldState.activeThreats && worldState.activeThreats.length > 0 && (
          <div className="world-item danger">
            <span className="world-icon">⚠️</span>
            <span className="world-text">Threats: {worldState.activeThreats.join(', ')}</span>
          </div>
        )}
        {worldState.availableInteractions && worldState.availableInteractions.length > 0 && (
          <div className="world-item interactive">
            <span className="world-icon">💡</span>
            <span className="world-text">Available: {worldState.availableInteractions.join(', ')}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="narrative-log">
      <div className="narrative-content" ref={logRef}>
        {/* World State Info */}
        {getWorldStateDisplay()}

        {/* Main Narrative */}
        <div className="narrative-section">
          <div className="section-header">
            <h3>📖 Story</h3>
          </div>
          <div className="narrative-text">
            {narrative ? (
              formatNarrative(narrative)
            ) : (
              <p className="narrative-placeholder">
                Welcome to the mystical realm of Yamato. Your adventure is about to begin...
              </p>
            )}
          </div>
        </div>

        {/* Recent Actions */}
        {recentActions && recentActions.length > 0 && (
          <div className="actions-section">
            <div className="section-header">
              <h4>⚡ Recent Actions</h4>
            </div>
            <div className="actions-list">
              {recentActions.map((action, index) => (
                <div key={index} className="action-item">
                  <div className="action-header">
                    <span className="action-player">{action.player_name}</span>
                    <span className="action-time">
                      {new Date(action.submitted_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="action-text">"{action.action_text}"</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-arrow">⬇️</div>
          <small>Scroll for more</small>
        </div>
      </div>
    </div>
  );
};

export default NarrativeLog;
