import React from 'react';
import '../styles/CharacterSheet.css';

const CharacterSheet = ({ character, sprite }) => {
  if (!character) {
    return (
      <div className="character-sheet">
        <div className="loading">Loading character...</div>
      </div>
    );
  }

  const getStatPercentage = (current, max) => {
    return Math.max(0, Math.min(100, (current / max) * 100));
  };

  const getStatColor = (statType) => {
    switch (statType) {
      case 'health': return '#ff4444';
      case 'chakra': return '#4444ff';
      case 'karma': return '#44ff44';
      case 'stamina': return '#ffaa00';
      default: return '#888';
    }
  };

  return (
    <div className="character-sheet">
      <div className="character-header">
        <div className="character-avatar">
          <div className="character-sprite">{sprite}</div>
        </div>
        <div className="character-identity">
          <h3 className="character-name">{character.player_name}</h3>
          <div className="character-class">{character.class_name}</div>
          <div className="character-level">Level {character.level || 1}</div>
        </div>
      </div>

      <div className="character-stats">
        <div className="stat-group">
          <div className="stat-row">
            <div className="stat-info">
              <span className="stat-label">Health</span>
              <span className="stat-numbers">
                {character.health}/{character.max_health}
              </span>
            </div>
            <div className="stat-bar">
              <div 
                className="stat-fill health"
                style={{ 
                  width: `${getStatPercentage(character.health, character.max_health)}%`,
                  backgroundColor: getStatColor('health')
                }}
              />
            </div>
          </div>

          <div className="stat-row">
            <div className="stat-info">
              <span className="stat-label">Chakra</span>
              <span className="stat-numbers">
                {character.chakra}/{character.max_chakra}
              </span>
            </div>
            <div className="stat-bar">
              <div 
                className="stat-fill chakra"
                style={{ 
                  width: `${getStatPercentage(character.chakra, character.max_chakra)}%`,
                  backgroundColor: getStatColor('chakra')
                }}
              />
            </div>
          </div>

          <div className="stat-row">
            <div className="stat-info">
              <span className="stat-label">Karma</span>
              <span className="stat-numbers">{character.karma}</span>
            </div>
            <div className="karma-display">
              <div className="karma-points">
                {Array.from({ length: Math.min(10, character.karma) }, (_, i) => (
                  <span key={i} className="karma-point">⭐</span>
                ))}
                {character.karma > 10 && <span className="karma-overflow">+{character.karma - 10}</span>}
              </div>
            </div>
          </div>

          <div className="stat-row">
            <div className="stat-info">
              <span className="stat-label">Stamina</span>
              <span className="stat-numbers">
                {character.stamina}/{character.max_stamina}
              </span>
            </div>
            <div className="stat-bar">
              <div 
                className="stat-fill stamina"
                style={{ 
                  width: `${getStatPercentage(character.stamina, character.max_stamina)}%`,
                  backgroundColor: getStatColor('stamina')
                }}
              />
            </div>
          </div>
        </div>

        <div className="experience-section">
          <div className="stat-info">
            <span className="stat-label">Experience</span>
            <span className="stat-numbers">{character.experience || 0} XP</span>
          </div>
          <div className="xp-bar">
            <div 
              className="xp-fill"
              style={{ width: `${((character.experience || 0) % 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status Effects */}
      {character.status_effects && character.status_effects.length > 0 && (
        <div className="status-effects">
          <h4>Status Effects</h4>
          <div className="effects-list">
            {character.status_effects.map((effect, index) => (
              <div key={index} className="status-effect">
                <span className="effect-icon">✨</span>
                <span className="effect-name">{effect}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory */}
      <div className="inventory-section">
        <h4>Inventory</h4>
        <div className="inventory-grid">
          {character.inventory && character.inventory.length > 0 ? (
            character.inventory.map((item, index) => (
              <div key={index} className="inventory-item">
                <span className="item-icon">📦</span>
                <span className="item-name">{item}</span>
              </div>
            ))
          ) : (
            <div className="empty-inventory">No items</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterSheet;
