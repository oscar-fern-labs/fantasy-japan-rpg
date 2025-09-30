import React, { useState, useEffect, useRef } from 'react';
import CharacterSheet from './CharacterSheet';
import NarrativeLog from './NarrativeLog';
import ActionPanel from './ActionPanel';
import '../styles/GameScreen.css';

const GameScreen = ({ gameData, playerData, lobbyData, onSubmitAction, onEndTurn, onRefresh }) => {
  const [actionText, setActionText] = useState('');
  const [turnEnded, setTurnEnded] = useState(false);
  const [refreshTimer, setRefreshTimer] = useState(0);

  // Get current player's character sheet
  const currentPlayerSheet = gameData?.players?.find(p => p.id === playerData?.id);

  // Auto-refresh game state
  useEffect(() => {
    const interval = setInterval(() => {
      onRefresh();
      setRefreshTimer(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [onRefresh]);

  // Reset turn state when round changes
  useEffect(() => {
    if (gameData?.lobby?.current_round) {
      setTurnEnded(false);
      setActionText('');
    }
  }, [gameData?.lobby?.current_round]);

  const handleSubmitAction = async () => {
    if (!actionText.trim()) {
      alert('Please enter an action or dialogue');
      return;
    }

    try {
      await onSubmitAction(actionText);
      // Don't clear the action text until turn is ended
    } catch (error) {
      console.error('Failed to submit action:', error);
    }
  };

  const handleEndTurn = async () => {
    try {
      await onEndTurn();
      setTurnEnded(true);
    } catch (error) {
      console.error('Failed to end turn:', error);
    }
  };

  const allPlayersReady = () => {
    return gameData?.players?.every(player => player.turn_ended) || false;
  };

  const getBufoSprite = (className) => {
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

  if (!gameData) {
    return (
      <div className="game-screen">
        <div className="loading-message">Loading game state...</div>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <div className="game-layout">
        {/* Left Panel - Character Sheet */}
        <div className="left-panel">
          <CharacterSheet 
            character={currentPlayerSheet}
            sprite={getBufoSprite(currentPlayerSheet?.class_name)}
          />
          
          <div className="other-players">
            <h3>Party Members</h3>
            <div className="party-list">
              {gameData.players
                .filter(p => p.id !== playerData?.id)
                .map(player => (
                  <div key={player.id} className="party-member">
                    <span className="party-sprite">
                      {getBufoSprite(player.class_name)}
                    </span>
                    <div className="party-info">
                      <div className="party-name">{player.player_name}</div>
                      <div className="party-class">{player.class_name}</div>
                      <div className="party-health">
                        HP: {player.health}/{player.max_health}
                      </div>
                    </div>
                    <div className="party-status">
                      {player.turn_ended ? '✅' : '⏳'}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Center Panel - Narrative */}
        <div className="center-panel">
          <div className="game-header">
            <div className="game-title">
              <h1>⛩️ Realm of Yamato ⛩️</h1>
              <div className="round-info">
                Round {gameData.lobby?.current_round || 1}
              </div>
            </div>
            <div className="game-status">
              {allPlayersReady() ? (
                <span className="status-processing">🔄 AI Processing...</span>
              ) : (
                <span className="status-waiting">⏳ Waiting for players...</span>
              )}
            </div>
          </div>

          <NarrativeLog 
            narrative={gameData.gameState?.current_narrative}
            worldState={gameData.gameState?.world_state}
            recentActions={gameData.currentActions}
          />
        </div>

        {/* Right Panel - Actions */}
        <div className="right-panel">
          <ActionPanel
            actionText={actionText}
            setActionText={setActionText}
            onSubmitAction={handleSubmitAction}
            onEndTurn={handleEndTurn}
            turnEnded={turnEnded}
            allPlayersReady={allPlayersReady()}
            disabled={gameData.lobby?.status !== 'active'}
          />

          <div className="quick-actions">
            <h4>Quick Actions</h4>
            <div className="quick-buttons">
              <button 
                className="quick-button"
                onClick={() => setActionText('I look around carefully, observing my surroundings.')}
              >
                🔍 Observe
              </button>
              <button 
                className="quick-button"
                onClick={() => setActionText('I meditate to center myself and restore inner peace.')}
              >
                🧘 Meditate
              </button>
              <button 
                className="quick-button"
                onClick={() => setActionText('I speak to my companions about our next move.')}
              >
                💬 Discuss
              </button>
              <button 
                className="quick-button"
                onClick={() => setActionText('I ready my weapon and prepare for combat.')}
              >
                ⚔️ Combat Ready
              </button>
              <button 
                className="quick-button"
                onClick={() => setActionText('I search for any hidden items or secrets.')}
              >
                🔎 Search
              </button>
              <button 
                className="quick-button"
                onClick={() => setActionText('I attempt to use my special abilities.')}
              >
                ✨ Use Ability
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
