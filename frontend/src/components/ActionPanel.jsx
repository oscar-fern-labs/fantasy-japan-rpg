import React, { useState, useRef, useEffect } from 'react';
import '../styles/ActionPanel.css';

const ActionPanel = ({ 
  actionText, 
  setActionText, 
  onSubmitAction, 
  onEndTurn, 
  turnEnded, 
  allPlayersReady,
  disabled 
}) => {
  const textareaRef = useRef(null);
  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;

  useEffect(() => {
    setCharCount(actionText.length);
  }, [actionText]);

  const handleTextChange = (e) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setActionText(text);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!disabled && actionText.trim()) {
        onSubmitAction();
      }
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [actionText]);

  return (
    <div className="action-panel">
      <div className="panel-header">
        <h3>🎭 Your Action</h3>
        <div className="turn-status">
          {turnEnded ? (
            <span className="status-ended">✅ Turn Ended</span>
          ) : (
            <span className="status-active">⏳ Your Turn</span>
          )}
        </div>
      </div>

      <div className="action-input-section">
        <div className="input-container">
          <textarea
            ref={textareaRef}
            className="action-input"
            placeholder="Describe your character's action, dialogue, or thoughts... 

Examples:
- I draw my katana and scan the shadows for enemies
- I whisper to my companions, 'Something feels wrong here'  
- I meditate to center my chakra and prepare for what's ahead"
            value={actionText}
            onChange={handleTextChange}
            onKeyPress={handleKeyPress}
            disabled={disabled || turnEnded}
            rows={4}
          />
          <div className="input-footer">
            <div className="char-counter">
              <span className={charCount > maxChars * 0.8 ? 'warning' : ''}>
                {charCount}/{maxChars}
              </span>
            </div>
            <div className="input-hint">
              Ctrl+Enter to submit
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="submit-action-btn retro-button"
            onClick={onSubmitAction}
            disabled={disabled || !actionText.trim() || turnEnded}
          >
            📝 Submit Action
          </button>
          
          <button
            className="end-turn-btn retro-button"
            onClick={onEndTurn}
            disabled={disabled || turnEnded}
          >
            {turnEnded ? '✅ Turn Ended' : '⏭️ End Turn'}
          </button>
        </div>
      </div>

      {/* Turn Status Info */}
      <div className="turn-info">
        {allPlayersReady ? (
          <div className="processing-info">
            <div className="processing-animation">🤖</div>
            <div className="processing-text">
              <strong>AI Dungeon Master is crafting the next part of your story...</strong>
              <p>All players have submitted their actions. The tale continues shortly!</p>
            </div>
          </div>
        ) : (
          <div className="waiting-info">
            <div className="waiting-animation">⏳</div>
            <div className="waiting-text">
              <strong>Waiting for other players to complete their turns</strong>
              <p>Your action has been {turnEnded ? 'submitted' : 'saved'}. The story will continue when everyone is ready.</p>
            </div>
          </div>
        )}
      </div>

      {/* Help Tips */}
      <div className="action-tips">
        <h4>💡 Action Tips</h4>
        <ul>
          <li><strong>Be descriptive:</strong> Paint a vivid picture of your character's actions</li>
          <li><strong>Include dialogue:</strong> What does your character say or think?</li>
          <li><strong>Consider consequences:</strong> Bold actions can lead to unexpected outcomes</li>
          <li><strong>Collaborate:</strong> Reference other players' actions when appropriate</li>
          <li><strong>Stay in character:</strong> Think about your class abilities and personality</li>
        </ul>
      </div>
    </div>
  );
};

export default ActionPanel;
