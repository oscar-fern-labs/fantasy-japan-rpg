const API_BASE_URL = 'https://backend-morphvm-m4c3u0o7.http.cloud.morph.so';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Character classes
  async getCharacterClasses() {
    return this.request('/api/character-classes');
  }

  // Lobby management
  async createLobby(name, maxPlayers = 6) {
    return this.request('/api/lobbies', {
      method: 'POST',
      body: JSON.stringify({ name, maxPlayers }),
    });
  }

  async getLobby(lobbyCode) {
    return this.request(`/api/lobbies/${lobbyCode}`);
  }

  async joinLobby(lobbyCode, playerName, characterClassId) {
    return this.request(`/api/lobbies/${lobbyCode}/join`, {
      method: 'POST',
      body: JSON.stringify({ playerName, characterClassId }),
    });
  }

  async startGame(lobbyCode) {
    return this.request(`/api/lobbies/${lobbyCode}/start`, {
      method: 'POST',
    });
  }

  // Game actions
  async getGameState(lobbyId) {
    return this.request(`/api/game/${lobbyId}/state`);
  }

  async submitAction(lobbyId, playerId, action) {
    return this.request(`/api/game/${lobbyId}/action`, {
      method: 'POST',
      body: JSON.stringify({ playerId, action }),
    });
  }

  async endTurn(lobbyId, playerId) {
    return this.request(`/api/game/${lobbyId}/end-turn`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  }
}

export const apiService = new ApiService();
