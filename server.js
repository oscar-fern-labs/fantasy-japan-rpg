const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { Pool } = require('pg');
const gameController = require('./controllers/gameController');
const lobbyController = require('./controllers/lobbyController');
const llmService = require('./services/llmService');

const app = express();
const server = http.createServer(app);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_5UPlouDMtx6z@ep-flat-mud-ae5oa4nw-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.static('public'));

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Make database and socket available to controllers
app.locals.db = pool;
app.locals.io = io;

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Fantasy Japan RPG Server is running!' });
});

app.get('/api/character-classes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM character_classes ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching character classes:', error);
    res.status(500).json({ error: 'Failed to fetch character classes' });
  }
});

// Lobby routes
app.post('/api/lobbies', lobbyController.createLobby);
app.get('/api/lobbies/:code', lobbyController.getLobby);
app.post('/api/lobbies/:code/join', lobbyController.joinLobby);
app.post('/api/lobbies/:code/start', lobbyController.startGame);

// Game routes
app.post('/api/game/:lobbyId/action', gameController.submitAction);
app.post('/api/game/:lobbyId/end-turn', gameController.endTurn);
app.get('/api/game/:lobbyId/state', gameController.getGameState);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join lobby room
  socket.on('join-lobby', async (data) => {
    const { lobbyCode, playerName } = data;
    console.log(`${playerName} joining lobby ${lobbyCode}`);
    
    try {
      // Update player socket ID in database
      await pool.query(
        'UPDATE players SET socket_id = $1 WHERE lobby_id = (SELECT id FROM lobbies WHERE lobby_code = $2) AND player_name = $3',
        [socket.id, lobbyCode, playerName]
      );
      
      socket.join(lobbyCode);
      socket.emit('lobby-joined', { success: true });
      
      // Broadcast to other players in the lobby
      socket.to(lobbyCode).emit('player-joined', { playerName });
      
    } catch (error) {
      console.error('Error joining lobby:', error);
      socket.emit('error', { message: 'Failed to join lobby' });
    }
  });

  // Handle action submission
  socket.on('submit-action', async (data) => {
    const { lobbyId, playerId, action, round } = data;
    
    try {
      // Store action in database
      await pool.query(
        'INSERT INTO turn_actions (lobby_id, player_id, round_number, action_text) VALUES ($1, $2, $3, $4)',
        [lobbyId, playerId, round, action]
      );
      
      // Get lobby code for room
      const lobbyResult = await pool.query('SELECT lobby_code FROM lobbies WHERE id = $1', [lobbyId]);
      const lobbyCode = lobbyResult.rows[0].lobby_code;
      
      // Broadcast action to all players in lobby
      io.to(lobbyCode).emit('action-submitted', { playerId, action });
      
    } catch (error) {
      console.error('Error submitting action:', error);
      socket.emit('error', { message: 'Failed to submit action' });
    }
  });

  // Handle turn end
  socket.on('end-turn', async (data) => {
    const { lobbyId, playerId } = data;
    
    try {
      // Mark player as turn ended
      await pool.query(
        'UPDATE players SET turn_ended = true WHERE id = $1',
        [playerId]
      );
      
      // Check if all players have ended their turn
      const playersResult = await pool.query(
        'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE turn_ended = true) as ended FROM players WHERE lobby_id = $1',
        [lobbyId]
      );
      
      const { total, ended } = playersResult.rows[0];
      
      // Get lobby code for room
      const lobbyResult = await pool.query('SELECT lobby_code FROM lobbies WHERE id = $1', [lobbyId]);
      const lobbyCode = lobbyResult.rows[0].lobby_code;
      
      if (parseInt(total) === parseInt(ended)) {
        // All players have ended their turn, process with LLM
        await processRound(lobbyId, lobbyCode);
      }
      
      // Broadcast turn end to all players
      io.to(lobbyCode).emit('turn-ended', { playerId, allPlayersReady: parseInt(total) === parseInt(ended) });
      
    } catch (error) {
      console.error('Error ending turn:', error);
      socket.emit('error', { message: 'Failed to end turn' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Process round with LLM
async function processRound(lobbyId, lobbyCode) {
  try {
    console.log(`Processing round for lobby ${lobbyId}`);
    
    // Get current game state
    const gameState = await pool.query('SELECT * FROM game_states WHERE lobby_id = $1', [lobbyId]);
    const currentGame = gameState.rows[0];
    
    // Get current round actions
    const currentRound = await pool.query('SELECT current_round FROM lobbies WHERE id = $1', [lobbyId]);
    const round = currentRound.rows[0].current_round;
    
    const actions = await pool.query(
      'SELECT ta.action_text, p.player_name, cc.name as class_name FROM turn_actions ta JOIN players p ON ta.player_id = p.id JOIN character_classes cc ON p.character_class_id = cc.id WHERE ta.lobby_id = $1 AND ta.round_number = $2',
      [lobbyId, round]
    );
    
    // Get player character sheets
    const characters = await pool.query(
      'SELECT cs.*, p.player_name, cc.name as class_name FROM character_sheets cs JOIN players p ON cs.player_id = p.id JOIN character_classes cc ON p.character_class_id = cc.id WHERE p.lobby_id = $1',
      [lobbyId]
    );
    
    // Prepare context for LLM
    const context = {
      currentNarrative: currentGame.current_narrative || "You find yourselves in the ancient realm of Yamato, where cherry blossoms dance on the wind and spirits roam the misty mountains...",
      worldState: currentGame.world_state || {},
      playerActions: actions.rows,
      characters: characters.rows,
      round: round
    };
    
    // Get response from LLM
    const llmResponse = await llmService.processRound(context);
    
    // Update game state
    await pool.query(
      'UPDATE game_states SET current_narrative = $1, world_state = $2, llm_context = $3, updated_at = NOW() WHERE lobby_id = $4',
      [llmResponse.narrative, JSON.stringify(llmResponse.worldState), JSON.stringify(context), lobbyId]
    );
    
    // Update character sheets if needed
    if (llmResponse.characterUpdates) {
      for (const update of llmResponse.characterUpdates) {
        await pool.query(
          'UPDATE character_sheets SET health = $1, chakra = $2, karma = $3, inventory = $4, status_effects = $5 WHERE player_id = $6',
          [update.health, update.chakra, update.karma, JSON.stringify(update.inventory), JSON.stringify(update.statusEffects), update.playerId]
        );
      }
    }
    
    // Reset turn flags and increment round
    await pool.query('UPDATE players SET turn_ended = false WHERE lobby_id = $1', [lobbyId]);
    await pool.query('UPDATE lobbies SET current_round = current_round + 1 WHERE id = $1', [lobbyId]);
    
    // Broadcast new narrative to all players
    io.to(lobbyCode).emit('round-processed', {
      narrative: llmResponse.narrative,
      worldState: llmResponse.worldState,
      characterUpdates: llmResponse.characterUpdates || [],
      round: round + 1
    });
    
  } catch (error) {
    console.error('Error processing round:', error);
    io.to(lobbyCode).emit('error', { message: 'Failed to process round' });
  }
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🏯 Fantasy Japan RPG server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server, pool };
