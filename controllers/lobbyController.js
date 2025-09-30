// const { v4: uuidv4 } = require('uuid');

// Generate a random 6-character lobby code
function generateLobbyCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const createLobby = async (req, res) => {
  try {
    const { name, maxPlayers = 6 } = req.body;
    const db = req.app.locals.db;
    
    let lobbyCode;
    let codeExists = true;
    
    // Generate unique lobby code
    while (codeExists) {
      lobbyCode = generateLobbyCode();
      const existing = await db.query('SELECT id FROM lobbies WHERE lobby_code = $1', [lobbyCode]);
      codeExists = existing.rows.length > 0;
    }
    
    // Create lobby
    const result = await db.query(
      'INSERT INTO lobbies (lobby_code, name, max_players) VALUES ($1, $2, $3) RETURNING *',
      [lobbyCode, name, maxPlayers]
    );
    
    // Create game state
    await db.query(
      'INSERT INTO game_states (lobby_id, current_narrative) VALUES ($1, $2)',
      [result.rows[0].id, 'Welcome to the mystical realm of Yamato. Your adventure begins now...']
    );
    
    res.status(201).json({
      lobby: result.rows[0],
      message: 'Lobby created successfully'
    });
    
  } catch (error) {
    console.error('Error creating lobby:', error);
    res.status(500).json({ error: 'Failed to create lobby' });
  }
};

const getLobby = async (req, res) => {
  try {
    const { code } = req.params;
    const db = req.app.locals.db;
    
    // Get lobby details with players
    const lobbyResult = await db.query(
      'SELECT * FROM lobbies WHERE lobby_code = $1',
      [code]
    );
    
    if (lobbyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lobby not found' });
    }
    
    const lobby = lobbyResult.rows[0];
    
    // Get players in lobby
    const playersResult = await db.query(
      'SELECT p.*, cc.name as class_name, cc.bufo_sprite FROM players p LEFT JOIN character_classes cc ON p.character_class_id = cc.id WHERE p.lobby_id = $1 ORDER BY p.joined_at',
      [lobby.id]
    );
    
    res.json({
      lobby,
      players: playersResult.rows
    });
    
  } catch (error) {
    console.error('Error getting lobby:', error);
    res.status(500).json({ error: 'Failed to get lobby' });
  }
};

const joinLobby = async (req, res) => {
  try {
    const { code } = req.params;
    const { playerName, characterClassId } = req.body;
    const db = req.app.locals.db;
    
    // Get lobby
    const lobbyResult = await db.query(
      'SELECT * FROM lobbies WHERE lobby_code = $1',
      [code]
    );
    
    if (lobbyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lobby not found' });
    }
    
    const lobby = lobbyResult.rows[0];
    
    // Check if lobby is full
    if (lobby.current_players >= lobby.max_players) {
      return res.status(400).json({ error: 'Lobby is full' });
    }
    
    // Check if name is already taken
    const existingPlayer = await db.query(
      'SELECT id FROM players WHERE lobby_id = $1 AND player_name = $2',
      [lobby.id, playerName]
    );
    
    if (existingPlayer.rows.length > 0) {
      return res.status(400).json({ error: 'Player name already taken' });
    }
    
    // Create player
    const playerResult = await db.query(
      'INSERT INTO players (lobby_id, player_name, character_class_id) VALUES ($1, $2, $3) RETURNING *',
      [lobby.id, playerName, characterClassId]
    );
    
    const player = playerResult.rows[0];
    
    // Get character class for base stats
    const classResult = await db.query(
      'SELECT * FROM character_classes WHERE id = $1',
      [characterClassId]
    );
    
    const characterClass = classResult.rows[0];
    
    // Create character sheet
    await db.query(
      'INSERT INTO character_sheets (player_id, health, max_health, chakra, max_chakra, karma) VALUES ($1, $2, $2, $3, $3, $4)',
      [player.id, characterClass.base_health, characterClass.base_chakra, characterClass.base_karma]
    );
    
    // Update lobby player count
    await db.query(
      'UPDATE lobbies SET current_players = current_players + 1 WHERE id = $1',
      [lobby.id]
    );
    
    res.status(201).json({
      player,
      characterClass,
      message: 'Successfully joined lobby'
    });
    
  } catch (error) {
    console.error('Error joining lobby:', error);
    res.status(500).json({ error: 'Failed to join lobby' });
  }
};

const startGame = async (req, res) => {
  try {
    const { code } = req.params;
    const db = req.app.locals.db;
    
    // Get lobby
    const lobbyResult = await db.query(
      'SELECT * FROM lobbies WHERE lobby_code = $1',
      [code]
    );
    
    if (lobbyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lobby not found' });
    }
    
    const lobby = lobbyResult.rows[0];
    
    // Check if enough players
    if (lobby.current_players < 2) {
      return res.status(400).json({ error: 'Need at least 2 players to start' });
    }
    
    // Update lobby status
    await db.query(
      'UPDATE lobbies SET status = $1, current_round = 1 WHERE id = $2',
      ['active', lobby.id]
    );
    
    // Emit game start to all players in lobby
    const io = req.app.locals.io;
    io.to(code).emit('game-started', { 
      message: 'Game has started! Prepare for adventure in the realm of Yamato...',
      round: 1
    });
    
    res.json({ message: 'Game started successfully' });
    
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
};

module.exports = {
  createLobby,
  getLobby,
  joinLobby,
  startGame
};
