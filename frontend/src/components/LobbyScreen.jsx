import React, { useState, useEffect } from 'react';
import '../styles/LobbyScreen.css';

const LobbyScreen = ({ lobbyData, playerData, onStartGame, onRefresh }) => {
  const [refreshTimer, setRefreshTimer] = useState(0);
  const [copying, setCopying] = useState(false);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      onRefresh();
      setRefreshTimer(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [onRefresh]);

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

  const copyLobbyCode = async () => {
    try {
      await navigator.clipboard.writeText(lobbyData.lobby.lobby_code);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch (err) {
      console.error('Failed to copy lobby code:', err);
    }
  };

  const canStartGame = () => {
    return lobbyData.players.length >= 2 && 
           lobbyData.lobby.status === 'waiting' &&
           lobbyData.players.some(p => p.id === playerData?.id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return '#ffd700';
      case 'active': return '#32cd32';
      case 'finished': return '#ff4444';
      default: return '#888';
    }
  };

  if (!lobbyData) {
    return (
      <div className="lobby-screen">
        <div className="loading-message">Loading lobby data...</div>
      </div>
    );
  }

  return (
    <div className="lobby-screen">
      <div className="lobby-container">
        {/* Header */}
        <div className="lobby-header">
          <div className="lobby-title-section">
            <h1 className="lobby-title glow-text">{lobbyData.lobby.name}</h1>
            <div className="lobby-status">
              <span 
                className="status-indicator"
                style={{ color: getStatusColor(lobbyData.lobby.status) }}
              >
                Status: {lobbyData.lobby.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="lobby-code-section">
            <div className="lobby-code-container">
              <label>Lobby Code:</label>
              <div className="lobby-code-display">
                <span className="lobby-code">{lobbyData.lobby.lobby_code}</span>
                <button 
                  className="copy-button retro-button"
                  onClick={copyLobbyCode}
                  title="Copy lobby code"
                >
                  {copying ? '✓' : '📋'}
                </button>
              </div>
              <small>Share this code with friends to join!</small>
            </div>
          </div>
        </div>

        {/* Players Section */}
        <div className="players-section">
          <div className="section-header">
            <h2>Players ({lobbyData.players.length}/{lobbyData.lobby.max_players})</h2>
            <button 
              className="refresh-button retro-button"
              onClick={onRefresh}
              title="Refresh player list"
            >
              🔄
            </button>
          </div>

          <div className="players-grid">
            {lobbyData.players.map((player, index) => (
              <div 
                key={player.id}
                className={`player-card ${player.id === playerData?.id ? 'current-player' : ''}`}
              >
                <div className="player-sprite">
                  {getBufoSprite(player.class_name)}
                </div>
                <div className="player-info">
                  <div className="player-name">
                    {player.player_name}
                    {player.id === playerData?.id && <span className="you-indicator">(You)</span>}
                  </div>
                  <div className="player-class">{player.class_name || 'Loading...'}</div>
                </div>
                <div className="player-ready-status">
                  {player.is_ready ? '✅ Ready' : '⏳ Waiting'}
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: lobbyData.lobby.max_players - lobbyData.players.length }).map((_, index) => (
              <div key={`empty-${index}`} className="player-card empty-slot">
                <div className="player-sprite">👤</div>
                <div className="player-info">
                  <div className="player-name">Waiting for player...</div>
                  <div className="player-class">Empty slot</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Info */}
        <div className="game-info-section">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Game Mode:</span>
              <span className="info-value">Multiplayer Adventure</span>
            </div>
            <div className="info-item">
              <span className="info-label">Setting:</span>
              <span className="info-value">Fantasy Medieval Japan</span>
            </div>
            <div className="info-item">
              <span className="info-label">Storyteller:</span>
              <span className="info-value">AI Dungeon Master</span>
            </div>
            <div className="info-item">
              <span className="info-label">Turn Style:</span>
              <span className="info-value">Simultaneous Rounds</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="lobby-actions">
          {lobbyData.lobby.status === 'waiting' ? (
            <>
              <div className="start-game-section">
                <p className="start-game-info">
                  {lobbyData.players.length < 2 
                    ? 'Waiting for more players to join...' 
                    : 'Ready to begin your adventure!'}
                </p>
                <button 
                  className="start-button retro-button"
                  onClick={onStartGame}
                  disabled={!canStartGame()}
                >
                  {lobbyData.players.length < 2 ? 'Need More Players' : 'Start Adventure'}
                </button>
              </div>
            </>
          ) : (
            <div className="game-status-section">
              <p className="game-status-message">
                {lobbyData.lobby.status === 'active' && 'Game in progress...'}
                {lobbyData.lobby.status === 'finished' && 'Game completed!'}
              </p>
            </div>
          )}
        </div>

        {/* Help text */}
        <div className="lobby-help">
          <p><strong>How to play:</strong></p>
          <ul>
            <li>Each round, type your character's action or dialogue</li>
            <li>Once all players submit their actions, the AI generates the next part of the story</li>
            <li>Your character stats may change based on your choices and the story events</li>
            <li>Work together or pursue your own goals - the choice is yours!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LobbyScreen;
