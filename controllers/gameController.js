const submitAction = async (req, res) => {
  try {
    const { lobbyId } = req.params;
    const { playerId, action } = req.body;
    const db = req.app.locals.db;
    
    // Get current round
    const roundResult = await db.query(
      'SELECT current_round FROM lobbies WHERE id = $1',
      [lobbyId]
    );
    
    if (roundResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lobby not found' });
    }
    
    const round = roundResult.rows[0].current_round;
    
    // Insert action
    await db.query(
      'INSERT INTO turn_actions (lobby_id, player_id, round_number, action_text) VALUES ($1, $2, $3, $4)',
      [lobbyId, playerId, round, action]
    );
    
    res.json({ message: 'Action submitted successfully' });
    
  } catch (error) {
    console.error('Error submitting action:', error);
    res.status(500).json({ error: 'Failed to submit action' });
  }
};

const endTurn = async (req, res) => {
  try {
    const { lobbyId } = req.params;
    const { playerId } = req.body;
    const db = req.app.locals.db;
    
    // Mark player as turn ended
    await db.query(
      'UPDATE players SET turn_ended = true WHERE id = $1',
      [playerId]
    );
    
    // Check if all players have ended their turn
    const playersResult = await db.query(
      'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE turn_ended = true) as ended FROM players WHERE lobby_id = $1',
      [lobbyId]
    );
    
    const { total, ended } = playersResult.rows[0];
    const allReady = parseInt(total) === parseInt(ended);
    
    res.json({ 
      message: 'Turn ended successfully',
      allPlayersReady: allReady
    });
    
  } catch (error) {
    console.error('Error ending turn:', error);
    res.status(500).json({ error: 'Failed to end turn' });
  }
};

const getGameState = async (req, res) => {
  try {
    const { lobbyId } = req.params;
    const db = req.app.locals.db;
    
    // Get lobby info
    const lobbyResult = await db.query(
      'SELECT * FROM lobbies WHERE id = $1',
      [lobbyId]
    );
    
    if (lobbyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lobby not found' });
    }
    
    // Get game state
    const gameStateResult = await db.query(
      'SELECT * FROM game_states WHERE lobby_id = $1',
      [lobbyId]
    );
    
    // Get players with character sheets
    const playersResult = await db.query(
      'SELECT p.*, cc.name as class_name, cc.bufo_sprite, cs.* FROM players p JOIN character_classes cc ON p.character_class_id = cc.id JOIN character_sheets cs ON p.id = cs.player_id WHERE p.lobby_id = $1 ORDER BY p.joined_at',
      [lobbyId]
    );
    
    // Get recent actions for current round
    const actionsResult = await db.query(
      'SELECT ta.*, p.player_name FROM turn_actions ta JOIN players p ON ta.player_id = p.id WHERE ta.lobby_id = $1 AND ta.round_number = $2 ORDER BY ta.submitted_at',
      [lobbyId, lobbyResult.rows[0].current_round]
    );
    
    res.json({
      lobby: lobbyResult.rows[0],
      gameState: gameStateResult.rows[0] || null,
      players: playersResult.rows,
      currentActions: actionsResult.rows
    });
    
  } catch (error) {
    console.error('Error getting game state:', error);
    res.status(500).json({ error: 'Failed to get game state' });
  }
};

module.exports = {
  submitAction,
  endTurn,
  getGameState
};
