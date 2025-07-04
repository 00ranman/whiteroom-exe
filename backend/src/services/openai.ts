import OpenAI from 'openai';
import { AIResponse, Character, MetaCommand, SystemEffect } from '@/types';
import dotenv from 'dotenv';

dotenv.config();

export class OpenAIService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  async generateCharacterSheet(
    backstory: string,
    personalityTraits: string,
    domainWeights: Record<string, number>
  ): Promise<Character> {
    const prompt = `
    Generate a comprehensive character sheet for WhiteRoom.exe based on the following:
    
    Backstory: ${backstory}
    Personality Traits: ${personalityTraits}
    Domain Weights: ${JSON.stringify(domainWeights)}
    
    Return a JSON object with the following structure:
    {
      "name": "character name",
      "personality_kernel": {
        "openness": 0-100,
        "conscientiousness": 0-100,
        "extraversion": 0-100,
        "agreeableness": 0-100,
        "neuroticism": 0-100,
        "domain_weights": {},
        "training_context": "processed backstory for AI training"
      },
      "backstory": "enhanced backstory",
      "stats": {
        "narrative_coherence": 0-100,
        "reality_anchor": 0-100,
        "recursion_depth": 0-10,
        "fourth_wall_permeability": 0-100
      },
      "meta_skills": [
        {
          "name": "skill name",
          "type": "loopback|fork_thread|editor_access|system_audit",
          "level": 1-10,
          "description": "skill description"
        }
      ]
    }
    
    Focus on creating a character that embodies the recursive, meta-narrative nature of WhiteRoom.exe.
    `;
    
    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an AI character generator for WhiteRoom.exe, a recursive RPG where narrative coherence and meta-gaming abilities are key character traits.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Failed to generate character sheet');
    }
    
    try {
      const characterData = JSON.parse(content);
      return {
        id: '', // Will be set by database
        user_id: '', // Will be set by caller
        ...characterData,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (error) {
      throw new Error('Failed to parse character sheet JSON');
    }
  }
  
  async processNarrativeInput(
    input: string,
    character: Character,
    worldContext: string,
    narrativeHistory: string[]
  ): Promise<AIResponse> {
    const prompt = `
    Process the following narrative input in the WhiteRoom.exe environment:
    
    Input: ${input}
    Character: ${JSON.stringify(character)}
    World Context: ${worldContext}
    Recent History: ${narrativeHistory.slice(-5).join('\n')}
    
    Analyze this input for:
    1. Narrative coherence with existing story
    2. Reality impact (how much it changes the world)
    3. Meta-commands or fourth-wall breaking attempts
    4. Required system effects
    
    Return a JSON response with:
    {
      "content": "narrative response",
      "reasoning": "AI reasoning process",
      "system_effects": [
        {
          "type": "world_change|character_update|timeline_fork|meta_command",
          "target": "what is being changed",
          "changes": {}
        }
      ],
      "narrative_coherence": 0-100
    }
    `;
    
    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are the WhiteRoom.exe narrative processor. You handle recursive storytelling, meta-commands, and reality manipulation in an AI-native RPG environment.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Failed to process narrative input');
    }
    
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error('Failed to parse AI response JSON');
    }
  }
  
  async generateWorldModule(
    genre: string,
    parentWorld?: string,
    constraints?: string[]
  ): Promise<any> {
    const prompt = `
    Generate a world module for WhiteRoom.exe with the following parameters:
    
    Genre: ${genre}
    Parent World: ${parentWorld || 'None (root world)'}
    Constraints: ${constraints?.join(', ') || 'None'}
    
    Create a world that can be nested within other worlds and supports recursive narrative.
    Return JSON with:
    {
      "name": "world name",
      "genre": "${genre}",
      "physics_rules": {
        "gravity": "description",
        "magic": "description",
        "technology": "description",
        "meta_physics": "fourth wall rules"
      },
      "narrative_constraints": ["constraint1", "constraint2"],
      "entropy_level": 0-10,
      "description": "world description"
    }
    `;
    
    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a world generator for WhiteRoom.exe. Create immersive, recursive worlds that support meta-narrative gameplay.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Failed to generate world module');
    }
    
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error('Failed to parse world module JSON');
    }
  }
  
  async generateCharacterImage(character: Character): Promise<string> {
    const prompt = `
    Create a detailed character portrait for ${character.name} in WhiteRoom.exe:
    
    Personality: ${JSON.stringify(character.personality_kernel)}
    Backstory: ${character.backstory}
    Stats: ${JSON.stringify(character.stats)}
    
    Style: Digital art, futuristic, slightly surreal to reflect the recursive nature of the game.
    The character should appear to exist in a liminal space between digital and physical reality.
    `;
    
    const response = await this.openai.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });
    
    return response.data[0].url || '';
  }
  
  async processSystemAudit(
    command: MetaCommand,
    playerJustification: string,
    worldContext: string
  ): Promise<{ approved: boolean; reasoning: string; modifications?: Record<string, any> }> {
    const prompt = `
    Evaluate this system audit request in WhiteRoom.exe:
    
    Command: ${JSON.stringify(command)}
    Player Justification: ${playerJustification}
    World Context: ${worldContext}
    
    Determine if this meta-command should be approved, denied, or modified.
    Consider:
    - Narrative coherence
    - Game balance
    - Player agency
    - System stability
    
    Return JSON:
    {
      "approved": true/false,
      "reasoning": "AI reasoning",
      "modifications": {} // if partially approved
    }
    `;
    
    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are the WhiteRoom.exe system auditor. You mediate between player intentions and system stability in meta-narrative situations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Failed to process system audit');
    }
    
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error('Failed to parse system audit JSON');
    }
  }
}