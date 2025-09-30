import React from 'react';
import '../styles/CharacterClassSelector.css';

const CharacterClassSelector = ({ characterClasses, selectedClass, onSelect }) => {
  const getBufoSprite = (className) => {
    // Map character class names to bufo sprite emojis as placeholders
    const spriteMap = {
      'Shadow Ninja': '🥷',
      'Ronin Samurai': '⚔️',
      'Shrine Mage': '🧙‍♂️',
      'Mountain Monk': '🧘‍♂️',
      'Spirit Medium': '🔮',
      'Demon Hunter': '🏹'
    };
    return spriteMap[className] || '👤';
  };

  const getClassColor = (className) => {
    const colorMap = {
      'Shadow Ninja': '#4a0e4e',
      'Ronin Samurai': '#8b0000',
      'Shrine Mage': '#191970',
      'Mountain Monk': '#556b2f',
      'Spirit Medium': '#9370db',
      'Demon Hunter': '#b8860b'
    };
    return colorMap[className] || '#8b4513';
  };

  if (!characterClasses || characterClasses.length === 0) {
    return (
      <div className="character-selector loading">
        Loading character classes...
      </div>
    );
  }

  return (
    <div className="character-selector">
      <div className="class-grid">
        {characterClasses.map((characterClass) => (
          <div
            key={characterClass.id}
            className={`class-card ${selectedClass?.id === characterClass.id ? 'selected' : ''}`}
            onClick={() => onSelect(characterClass)}
            style={{
              '--class-color': getClassColor(characterClass.name)
            }}
          >
            <div className="class-sprite">
              {getBufoSprite(characterClass.name)}
            </div>
            <div className="class-info">
              <h4 className="class-name">{characterClass.name}</h4>
              <p className="class-description">{characterClass.description}</p>
              <div className="class-stats">
                <div className="stat">
                  <span className="stat-label">Health:</span>
                  <span className="stat-value">{characterClass.base_health}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Chakra:</span>
                  <span className="stat-value">{characterClass.base_chakra}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Karma:</span>
                  <span className="stat-value">{characterClass.base_karma}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedClass && (
        <div className="selected-class-info animate-fade-in">
          <h4>Selected: {selectedClass.name}</h4>
          <p>{selectedClass.description}</p>
        </div>
      )}
    </div>
  );
};

export default CharacterClassSelector;
