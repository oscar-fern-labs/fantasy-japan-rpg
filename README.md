# Fantasy Japan RPG

A multiplayer text-based RPG set in fantasy medieval Japan, powered by AI storytelling.

## Features

🏯 **Immersive Setting**: Fantasy medieval Japan with samurai, ninjas, spirits, and mythical creatures
🎭 **AI Dungeon Master**: Powered by Cerebras LLM for dynamic, responsive storytelling
👥 **Multiplayer**: Support for up to 6 players per lobby
🎲 **Character Classes**: Choose from 6 unique classes with distinct abilities
⚡ **Real-time**: WebSocket-based real-time gameplay
📊 **Character Progression**: Health, Chakra, Karma system with persistent stats

## Character Classes

- **Shadow Ninja**: Masters of stealth and deception
- **Ronin Samurai**: Masterless warriors following the way of the sword  
- **Shrine Mage**: Keepers of ancient wisdom and elemental magic
- **Mountain Monk**: Disciples of inner peace and martial prowess
- **Spirit Medium**: Communicators with the spirit world and healers
- **Demon Hunter**: Sworn enemies of yokai and dark forces

## Technology Stack

- **Backend**: Node.js, Express, Socket.IO
- **Database**: PostgreSQL (Neon)
- **AI**: Cerebras API (Llama 3.1-70B)
- **Real-time Communication**: WebSockets

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon account)
- Cerebras API key

### Installation

```bash
# Clone repository
git clone https://github.com/oscar-fern-labs/fantasy-japan-rpg.git
cd fantasy-japan-rpg

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and Cerebras API key

# Start server
npm start
```

### Environment Variables

```
PORT=3000
DATABASE_URL=your_postgresql_connection_string
CEREBRAS_API_KEY=your_cerebras_api_key
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Character Classes
- `GET /api/character-classes` - List all character classes

### Lobbies
- `POST /api/lobbies` - Create new lobby
- `GET /api/lobbies/:code` - Get lobby details
- `POST /api/lobbies/:code/join` - Join lobby
- `POST /api/lobbies/:code/start` - Start game

### Game
- `POST /api/game/:lobbyId/action` - Submit player action
- `POST /api/game/:lobbyId/end-turn` - End player turn
- `GET /api/game/:lobbyId/state` - Get current game state

## WebSocket Events

### Client to Server
- `join-lobby` - Join a lobby room
- `submit-action` - Submit player action
- `end-turn` - End player turn

### Server to Client
- `lobby-joined` - Successful lobby join
- `player-joined` - Another player joined
- `action-submitted` - Action was submitted
- `turn-ended` - Turn ended
- `round-processed` - New story content from AI
- `game-started` - Game has begun

## Game Flow

1. **Lobby Creation**: Player creates lobby with unique code
2. **Player Join**: Up to 6 players join using lobby code
3. **Character Selection**: Each player chooses a character class
4. **Game Start**: When ready, host starts the game
5. **Turn-based Rounds**: 
   - Players submit text actions
   - When all players end turn, AI processes the round
   - New narrative and consequences are generated
   - Character stats may be updated
6. **Continuous Adventure**: Rounds continue until story resolution

## Database Schema

- `lobbies` - Game lobby information
- `players` - Player data and lobby membership
- `character_classes` - Available character archetypes
- `character_sheets` - Player character stats and inventory
- `game_states` - Current narrative and world state
- `turn_actions` - Player actions by round

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Live Demo

Backend API: https://backend-morphvm-m4c3u0o7.http.cloud.morph.so/health
