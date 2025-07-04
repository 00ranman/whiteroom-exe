import { 
  GameSession, 
  WorldModule, 
  Character, 
  NarrativeState, 
  NarrativeEvent, 
  Timeline, 
  RecursionFrame,
  MetaCommand,
  SystemEffect
} from '@/types';
import { OpenAIService } from './openai';
import { redisClient } from '@/config/database';

export class WhiteRoomEngine {
  private openai: OpenAIService;
  private activeSessions: Map<string, GameSession> = new Map();
  
  constructor() {
    this.openai = new OpenAIService();
  }
  
  async initializeSession(architectId: string, players: string[]): Promise<GameSession> {
    const session: GameSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      architect_id: architectId,
      players,
      current_world: await this.createDefaultWhiteRoom(),
      narrative_state: {
        current_scene: 'The White Room - Ground State',
        active_timelines: [{
          id: 'main_timeline',
          branch_point: 'session_start',
          events: [],
          probability: 1.0,
          is_active: true
        }],
        character_states: {},
        world_consistency: {},
        recursion_stack: []
      },
      created_at: new Date(),
      updated_at: new Date()
    };
    
    this.activeSessions.set(session.id, session);
    await this.saveSessionState(session);
    
    return session;
  }
  
  private async createDefaultWhiteRoom(): Promise<WorldModule> {
    return {
      id: 'whiteroom_default',
      name: 'The White Room',
      genre: 'meta-reality',
      nested_worlds: [],
      physics_rules: {
        gravity: 'Optional - exists only if acknowledged',
        magic: 'Reality manipulation through narrative assertion',
        technology: 'AI-substrate interface',
        meta_physics: 'Fourth wall is permeable - direct system access possible',
        entropy: 'Contradictions collapse probability waves',
        recursion: 'Infinite depth possible - limited by narrative coherence'
      },
      narrative_constraints: [
        'Nothing exists until spoken or claimed',
        'Contradictions create timeline forks',
        'Meta-commands require system audit',
        'Reality anchors prevent infinite recursion'
      ],
      entropy_level: 0,
      created_by: 'system'
    };
  }
  
  async processPlayerInput(
    sessionId: string,
    playerId: string,
    input: string,
    character: Character
  ): Promise<{ response: string; effects: SystemEffect[] }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    const narrativeHistory = await this.getNarrativeHistory(sessionId, 10);
    const worldContext = this.buildWorldContext(session.current_world, session.narrative_state);
    
    const aiResponse = await this.openai.processNarrativeInput(
      input,
      character,
      worldContext,
      narrativeHistory
    );
    
    const event: NarrativeEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: this.determineEventType(input),
      actor_id: playerId,
      content: input,
      timestamp: new Date(),
      reality_impact: this.calculateRealityImpact(input, aiResponse)
    };
    
    await this.addNarrativeEvent(sessionId, event);
    
    for (const effect of aiResponse.system_effects) {
      await this.applySystemEffect(sessionId, effect);
    }
    
    await this.updateNarrativeCoherence(sessionId, aiResponse.narrative_coherence);
    
    return {
      response: aiResponse.content,
      effects: aiResponse.system_effects
    };
  }
  
  async executeMetaCommand(
    sessionId: string,
    playerId: string,
    command: MetaCommand
  ): Promise<{ success: boolean; message: string; auditRequired?: boolean }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    if (command.requires_audit) {
      return {
        success: false,
        message: 'Command requires system audit',
        auditRequired: true
      };
    }
    
    switch (command.command) {
      case 'fork_timeline':
        return await this.forkTimeline(sessionId, command.parameters);
      
      case 'modify_world':
        return await this.modifyWorld(sessionId, command.parameters);
      
      case 'rewrite_past':
        return await this.rewritePast(sessionId, command.parameters);
      
      case 'spawn_world':
        return await this.spawnNestedWorld(sessionId, command.parameters);
      
      case 'break_fourth_wall':
        return await this.breakFourthWall(sessionId, command.parameters);
      
      default:
        return {
          success: false,
          message: `Unknown meta-command: ${command.command}`
        };
    }
  }
  
  private async forkTimeline(sessionId: string, parameters: Record<string, any>): Promise<{ success: boolean; message: string }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    const newTimeline: Timeline = {
      id: `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      branch_point: parameters.branch_point || 'current',
      events: [],
      probability: parameters.probability || 0.5,
      is_active: true
    };
    
    session.narrative_state.active_timelines.push(newTimeline);
    await this.saveSessionState(session);
    
    return {
      success: true,
      message: `Timeline forked: ${newTimeline.id}`
    };
  }
  
  private async modifyWorld(sessionId: string, parameters: Record<string, any>): Promise<{ success: boolean; message: string }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    const modifications = parameters.modifications || {};
    
    Object.keys(modifications).forEach(key => {
      if (session.current_world.physics_rules[key] !== undefined) {
        session.current_world.physics_rules[key] = modifications[key];
      }
    });
    
    session.current_world.entropy_level += 1;
    await this.saveSessionState(session);
    
    return {
      success: true,
      message: 'World modified successfully'
    };
  }
  
  private async rewritePast(sessionId: string, parameters: Record<string, any>): Promise<{ success: boolean; message: string }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    const eventId = parameters.event_id;
    const newContent = parameters.new_content;
    
    const timeline = session.narrative_state.active_timelines.find(t => t.is_active);
    if (!timeline) {
      throw new Error('No active timeline found');
    }
    
    const event = timeline.events.find(e => e.id === eventId);
    if (!event) {
      return {
        success: false,
        message: 'Event not found in timeline'
      };
    }
    
    event.content = newContent;
    event.reality_impact *= 0.8; // Reduce impact of rewritten events
    
    session.current_world.entropy_level += 2;
    await this.saveSessionState(session);
    
    return {
      success: true,
      message: 'Past event rewritten'
    };
  }
  
  private async spawnNestedWorld(sessionId: string, parameters: Record<string, any>): Promise<{ success: boolean; message: string }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    const genre = parameters.genre;
    const constraints = parameters.constraints || [];
    
    const nestedWorld = await this.openai.generateWorldModule(
      genre,
      session.current_world.name,
      constraints
    );
    
    nestedWorld.id = `world_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    nestedWorld.parent_world_id = session.current_world.id;
    
    session.current_world.nested_worlds.push(nestedWorld.id);
    
    const recursionFrame: RecursionFrame = {
      level: session.narrative_state.recursion_stack.length + 1,
      world_id: nestedWorld.id,
      entry_point: 'spawn_command',
      modified_rules: nestedWorld.physics_rules,
      exit_conditions: parameters.exit_conditions || []
    };
    
    session.narrative_state.recursion_stack.push(recursionFrame);
    await this.saveSessionState(session);
    
    return {
      success: true,
      message: `Nested world spawned: ${nestedWorld.name}`
    };
  }
  
  private async breakFourthWall(sessionId: string, parameters: Record<string, any>): Promise<{ success: boolean; message: string }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    const wallType = parameters.wall_type || 'narrative';
    
    switch (wallType) {
      case 'narrative':
        return {
          success: true,
          message: 'You feel the boundaries of story and reality blur. The AI acknowledges your presence.'
        };
      
      case 'system':
        return {
          success: true,
          message: 'System access granted. You can now see the underlying game mechanics.'
        };
      
      case 'meta':
        return {
          success: true,
          message: 'You have broken through to the meta-layer. Reality becomes malleable.'
        };
      
      default:
        return {
          success: false,
          message: 'Unknown wall type'
        };
    }
  }
  
  private buildWorldContext(world: WorldModule, narrativeState: NarrativeState): string {
    return `
    Current World: ${world.name} (${world.genre})
    Physics Rules: ${JSON.stringify(world.physics_rules)}
    Entropy Level: ${world.entropy_level}
    Active Timelines: ${narrativeState.active_timelines.length}
    Recursion Depth: ${narrativeState.recursion_stack.length}
    Current Scene: ${narrativeState.current_scene}
    `;
  }
  
  private determineEventType(input: string): 'action' | 'dialogue' | 'system' | 'meta' {
    if (input.includes('/>') || input.includes('sudo') || input.includes('meta:')) {
      return 'meta';
    }
    if (input.startsWith('"') && input.endsWith('"')) {
      return 'dialogue';
    }
    if (input.includes('system:') || input.includes('>>')) {
      return 'system';
    }
    return 'action';
  }
  
  private calculateRealityImpact(input: string, aiResponse: any): number {
    let impact = 0.1; // Base impact
    
    if (aiResponse.system_effects.length > 0) {
      impact += aiResponse.system_effects.length * 0.2;
    }
    
    if (input.includes('reality') || input.includes('world') || input.includes('existence')) {
      impact += 0.3;
    }
    
    return Math.min(impact, 1.0);
  }
  
  private async applySystemEffect(sessionId: string, effect: SystemEffect): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;
    
    switch (effect.type) {
      case 'world_change':
        Object.assign(session.current_world.physics_rules, effect.changes);
        break;
      
      case 'character_update':
        if (session.narrative_state.character_states[effect.target]) {
          Object.assign(session.narrative_state.character_states[effect.target], effect.changes);
        }
        break;
      
      case 'timeline_fork':
        // Timeline forking handled in executeMetaCommand
        break;
      
      case 'meta_command':
        // Meta commands handled separately
        break;
    }
    
    await this.saveSessionState(session);
  }
  
  private async updateNarrativeCoherence(sessionId: string, coherence: number): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;
    
    // Update world consistency based on coherence
    session.narrative_state.world_consistency['overall'] = coherence > 70;
    
    if (coherence < 50) {
      session.current_world.entropy_level += 1;
    }
    
    await this.saveSessionState(session);
  }
  
  private async getNarrativeHistory(sessionId: string, limit: number): Promise<string[]> {
    const cacheKey = `narrative_history:${sessionId}`;
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      const history = JSON.parse(cached);
      return history.slice(-limit);
    }
    
    return [];
  }
  
  private async addNarrativeEvent(sessionId: string, event: NarrativeEvent): Promise<void> {
    const cacheKey = `narrative_history:${sessionId}`;
    const cached = await redisClient.get(cacheKey);
    
    let history: string[] = [];
    if (cached) {
      history = JSON.parse(cached);
    }
    
    history.push(`${event.type}: ${event.content}`);
    
    // Keep only last 50 events
    if (history.length > 50) {
      history = history.slice(-50);
    }
    
    await redisClient.setex(cacheKey, 3600, JSON.stringify(history));
  }
  
  private async saveSessionState(session: GameSession): Promise<void> {
    const cacheKey = `session:${session.id}`;
    await redisClient.setex(cacheKey, 3600, JSON.stringify(session));
    this.activeSessions.set(session.id, session);
  }
  
  async getSession(sessionId: string): Promise<GameSession | null> {
    if (this.activeSessions.has(sessionId)) {
      return this.activeSessions.get(sessionId)!;
    }
    
    const cacheKey = `session:${sessionId}`;
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      const session = JSON.parse(cached);
      this.activeSessions.set(sessionId, session);
      return session;
    }
    
    return null;
  }
}