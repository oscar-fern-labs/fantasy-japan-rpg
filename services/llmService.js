const axios = require('axios');

const CEREBRAS_API_KEY = 'csk-tmekrrwkvej8mek8dt8nep44kkhk4v8rky9wp3v8m834wtrm';
const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions';

async function processRound(context) {
  try {
    const prompt = buildGamePrompt(context);
    
    const response = await axios.post(
      CEREBRAS_API_URL,
      {
        model: 'llama3.1-70b',
        messages: [
          {
            role: 'system',
            content: `You are a master storyteller and dungeon master for a multiplayer text-based RPG set in fantasy medieval Japan. 
            
Your role is to:
1. Continue the narrative based on player actions
2. Create immersive scenes with samurai, ninjas, spirits, and mythical creatures
3. Respond to each player's action in an engaging way
4. Introduce new challenges, encounters, or plot developments
5. Update character stats when appropriate (health, chakra, karma)
6. Keep the story moving forward while respecting player choices

Style guidelines:
- Write in vivid, cinematic prose
- Include Japanese cultural elements (honor, duty, spirits, temples, etc.)
- Create atmospheric descriptions of settings
- Make each player feel their actions matter
- Balance action with character development
- Use present tense, second person when addressing players

You must respond with valid JSON in this exact format:
{
  "narrative": "The main story continuation (2-4 paragraphs)",
  "worldState": {
    "location": "current location name",
    "timeOfDay": "time/weather",
    "activeThreats": ["any active dangers"],
    "availableInteractions": ["things players can interact with"]
  },
  "characterUpdates": [
    {
      "playerId": "player_uuid",
      "health": 100,
      "chakra": 50,
      "karma": 15,
      "inventory": ["item1", "item2"],
      "statusEffects": ["effect1"]
    }
  ],
  "soundEffects": ["effect1", "effect2"]
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Parse the response
    let result;
    try {
      result = JSON.parse(response.data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse LLM response as JSON:', parseError);
      // Fallback response
      result = {
        narrative: response.data.choices[0].message.content || 'The adventure continues as your actions ripple through the mystical realm of Yamato...',
        worldState: context.worldState || {},
        characterUpdates: [],
        soundEffects: []
      };
    }

    return result;

  } catch (error) {
    console.error('Error calling Cerebras API:', error.response?.data || error.message);
    
    // Fallback response in case of API failure
    return {
      narrative: "The winds of fate swirl around you as your actions echo through the realm. The spirits watch your every move, and destiny calls you forward into the unknown depths of Yamato...",
      worldState: context.worldState || {
        location: "Unknown Realm",
        timeOfDay: "twilight",
        activeThreats: [],
        availableInteractions: ["explore surroundings", "meditate", "investigate"]
      },
      characterUpdates: [],
      soundEffects: ['wind', 'mystical']
    };
  }
}

function buildGamePrompt(context) {
  const { currentNarrative, worldState, playerActions, characters, round } = context;
  
  let prompt = `# GAME STATE - ROUND ${round}

## Current Narrative:
${currentNarrative}

## World State:
${JSON.stringify(worldState, null, 2)}

## Player Characters:`;

  characters.forEach(char => {
    prompt += `
- **${char.player_name}** (${char.class_name})
  - Health: ${char.health}/${char.max_health}
  - Chakra: ${char.chakra}/${char.max_chakra} 
  - Karma: ${char.karma}
  - Status: ${char.status_effects?.length ? char.status_effects.join(', ') : 'Normal'}`;
  });

  prompt += `\n\n## Player Actions This Round:`;

  playerActions.forEach(action => {
    prompt += `\n- **${action.player_name}** (${action.class_name}): "${action.action_text}"`;
  });

  prompt += `\n\nAs the master storyteller, continue the narrative by:
1. Describing the immediate consequences of each player's actions
2. Advancing the plot with new developments, encounters, or discoveries
3. Creating vivid scenes that immerse players in fantasy medieval Japan
4. Updating character stats if their actions warrant it (combat, magic use, discoveries, etc.)
5. Setting up the next phase of the adventure

Respond with valid JSON only.`;

  return prompt;
}

module.exports = {
  processRound
};
