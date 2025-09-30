import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';
import { socketService } from './services/socketService';
import { apiService } from './services/apiService';

const App = () => {
  const [gameState, setGameState] = useState('welcome'); // welcome, lobby, game
  const [playerData, setPlayerData] = useState(null);
  const [lobbyData, setLobbyData] = useState(null);
  const [characterClasses, setCharacterClasses] = useState([]);
  const [gameData, setGameData] = useState(null);
  const [error, setError] = useState(null);

  // Load character classes on app start
  useEffect(() => {
    const loadCharacterClasses = async () => {
      try {
        const classes = await apiService.getCharacterClasses();
        setCharacterClasses(classes);
      } catch (err) {
        console.error('Failed to load character classes:', err);
        setError('Failed to connect to server');
      }
    };

    loadCharacterClasses();
  }, []);

  // Socket event handlers
  useEffect(() => {
    socketService.on('lobby-joined', handleLobbyJoined);
    socketService.on('player-joined', handlePlayerJoined);
    socketService.on('game-started', handleGameStarted);
    socketService.on('round-processed', handleRoundProcessed);
    socketService.on('error', handleSocketError);

    return () => {
      socketService.off('lobby-joined');
      socketService.off('player-joined');
      socketService.off('game-started');
      socketService.off('round-processed');
      socketService.off('error');
    };
  }, []);

  const handleLobbyJoined = (data) => {
    console.log('Lobby joined:', data);
  };

  const handlePlayerJoined = (data) => {
    console.log('Player joined:', data);
    // Refresh lobby data
    if (lobbyData) {
      refreshLobbyData(lobbyData.lobby_code);
    }
  };

  const handleGameStarted = (data) => {
    console.log('Game started:', data);
    setGameState('game');
    loadGameState();
  };

  const handleRoundProcessed = (data) => {
    console.log('Round processed:', data);
    setGameData(prev => ({
      ...prev,
      narrative: data.narrative,
      worldState: data.worldState,
      round: data.round,
      characterUpdates: data.characterUpdates
    }));
  };

  const handleSocketError = (data) => {
    console.error('Socket error:', data);
    setError(data.message);
  };

  const createLobby = async (lobbyName, maxPlayers) => {
    try {
      setError(null);
      const lobby = await apiService.createLobby(lobbyName, maxPlayers);
      setLobbyData(lobby);
      setGameState('lobby');
      return lobby.lobby_code;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const joinLobby = async (lobbyCode, playerName, characterClassId) => {
    try {
      setError(null);
      const result = await apiService.joinLobby(lobbyCode, playerName, characterClassId);
      setPlayerData(result.player);
      
      // Get full lobby data
      const lobby = await apiService.getLobby(lobbyCode);
      setLobbyData(lobby);
      
      // Connect to socket
      socketService.connect();
      socketService.emit('join-lobby', { lobbyCode, playerName });
      
      setGameState('lobby');
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const refreshLobbyData = async (lobbyCode) => {
    try {
      const lobby = await apiService.getLobby(lobbyCode);
      setLobbyData(lobby);
    } catch (err) {
      console.error('Failed to refresh lobby data:', err);
    }
  };

  const startGame = async () => {
    try {
      setError(null);
      await apiService.startGame(lobbyData.lobby.lobby_code);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loadGameState = async () => {
    try {
      if (lobbyData) {
        const gameState = await apiService.getGameState(lobbyData.lobby.id);
        setGameData(gameState);
      }
    } catch (err) {
      console.error('Failed to load game state:', err);
      setError('Failed to load game state');
    }
  };

  const submitAction = async (action) => {
    try {
      if (lobbyData && playerData) {
        await apiService.submitAction(lobbyData.lobby.id, playerData.id, action);
        socketService.emit('submit-action', {
          lobbyId: lobbyData.lobby.id,
          playerId: playerData.id,
          action,
          round: gameData?.lobby?.current_round || 1
        });
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const endTurn = async () => {
    try {
      if (lobbyData && playerData) {
        await apiService.endTurn(lobbyData.lobby.id, playerData.id);
        socketService.emit('end-turn', {
          lobbyId: lobbyData.lobby.id,
          playerId: playerData.id
        });
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <div className="app-container">
      {error && (
        <div style={{ 
          background: '#ff4444', 
          padding: '10px', 
          marginBottom: '20px', 
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {error}
          <button 
            onClick={() => setError(null)} 
            style={{ marginLeft: '10px', background: 'transparent', border: '1px solid white', color: 'white', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {gameState === 'welcome' && (
        <WelcomeScreen
          onCreateLobby={createLobby}
          onJoinLobby={joinLobby}
          characterClasses={characterClasses}
        />
      )}

      {gameState === 'lobby' && (
        <LobbyScreen
          lobbyData={lobbyData}
          playerData={playerData}
          onStartGame={startGame}
          onRefresh={() => refreshLobbyData(lobbyData.lobby.lobby_code)}
        />
      )}

      {gameState === 'game' && (
        <GameScreen
          gameData={gameData}
          playerData={playerData}
          lobbyData={lobbyData}
          onSubmitAction={submitAction}
          onEndTurn={endTurn}
          onRefresh={loadGameState}
        />
      )}
    </div>
  );
};

export default App;
