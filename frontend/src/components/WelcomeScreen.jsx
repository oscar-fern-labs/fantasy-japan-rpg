import React, { useState } from 'react';
import CharacterClassSelector from './CharacterClassSelector';
import '../styles/WelcomeScreen.css';

const WelcomeScreen = ({ onCreateLobby, onJoinLobby, characterClasses }) => {
  const [mode, setMode] = useState('menu'); // menu, create, join
  const [lobbyName, setLobbyName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [loading, setLoading] = useState(false);

  const handleCreateLobby = async () => {
    if (!lobbyName.trim()) {
      alert('Please enter a lobby name');
      return;
    }

    try {
      setLoading(true);
      const createdLobbyCode = await onCreateLobby(lobbyName, maxPlayers);
      // Reset form
      setLobbyName('');
      setMaxPlayers(6);
    } catch (error) {
      console.error('Failed to create lobby:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLobby = async () => {
    if (!lobbyCode.trim()) {
      alert('Please enter a lobby code');
      return;
    }
    if (!playerName.trim()) {
      alert('Please enter your player name');
      return;
    }
    if (!selectedClass) {
      alert('Please select a character class');
      return;
    }

    try {
      setLoading(true);
      await onJoinLobby(lobbyCode.toUpperCase(), playerName, selectedClass.id);
    } catch (error) {
      console.error('Failed to join lobby:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMainMenu = () => (
    <div className="welcome-menu animate-fade-in">
      <div className="title-section">
        <h1 className="game-title glow-text animate-glow">
          🏯 FANTASY JAPAN RPG 🏯
        </h1>
        <p className="game-subtitle">
          A multiplayer text-based adventure in the mystical realm of Yamato
        </p>
      </div>

      <div className="menu-buttons">
        <button 
          className="retro-button menu-button"
          onClick={() => setMode('create')}
          disabled={loading}
        >
          Create New Adventure
        </button>
        <button 
          className="retro-button menu-button"
          onClick={() => setMode('join')}
          disabled={loading}
        >
          Join Adventure
        </button>
      </div>

      <div className="feature-highlights">
        <div className="feature-item">
          <span className="feature-icon">⚔️</span>
          <span>6 Unique Character Classes</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🎭</span>
          <span>AI-Powered Storytelling</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">👥</span>
          <span>Multiplayer (2-6 Players)</span>
        </div>
      </div>
    </div>
  );

  const renderCreateLobby = () => (
    <div className="create-lobby animate-slide-in">
      <button 
        className="back-button retro-button"
        onClick={() => setMode('menu')}
      >
        ← Back
      </button>

      <h2 className="section-title glow-text">Create New Adventure</h2>

      <div className="form-group">
        <label>Adventure Name:</label>
        <input
          type="text"
          className="retro-input"
          value={lobbyName}
          onChange={(e) => setLobbyName(e.target.value)}
          placeholder="Enter adventure name..."
          maxLength={50}
        />
      </div>

      <div className="form-group">
        <label>Maximum Players:</label>
        <select
          className="retro-input"
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
        >
          <option value={2}>2 Players</option>
          <option value={3}>3 Players</option>
          <option value={4}>4 Players</option>
          <option value={5}>5 Players</option>
          <option value={6}>6 Players</option>
        </select>
      </div>

      <button 
        className="retro-button action-button"
        onClick={handleCreateLobby}
        disabled={loading || !lobbyName.trim()}
      >
        {loading ? 'Creating...' : 'Create Adventure'}
      </button>
    </div>
  );

  const renderJoinLobby = () => (
    <div className="join-lobby animate-slide-in">
      <button 
        className="back-button retro-button"
        onClick={() => setMode('menu')}
      >
        ← Back
      </button>

      <h2 className="section-title glow-text">Join Adventure</h2>

      <div className="form-section">
        <div className="form-group">
          <label>Adventure Code:</label>
          <input
            type="text"
            className="retro-input"
            value={lobbyCode}
            onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-character code..."
            maxLength={6}
            style={{ textTransform: 'uppercase', letterSpacing: '2px' }}
          />
        </div>

        <div className="form-group">
          <label>Your Name:</label>
          <input
            type="text"
            className="retro-input"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name..."
            maxLength={20}
          />
        </div>
      </div>

      <div className="character-selection">
        <h3>Choose Your Character Class:</h3>
        <CharacterClassSelector
          characterClasses={characterClasses}
          selectedClass={selectedClass}
          onSelect={setSelectedClass}
        />
      </div>

      <button 
        className="retro-button action-button"
        onClick={handleJoinLobby}
        disabled={loading || !lobbyCode.trim() || !playerName.trim() || !selectedClass}
      >
        {loading ? 'Joining...' : 'Join Adventure'}
      </button>
    </div>
  );

  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        {mode === 'menu' && renderMainMenu()}
        {mode === 'create' && renderCreateLobby()}
        {mode === 'join' && renderJoinLobby()}
      </div>
    </div>
  );
};

export default WelcomeScreen;
