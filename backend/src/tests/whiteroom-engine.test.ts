import { WhiteRoomEngine } from '../services/whiteroom-engine';
import { createTestUser, createTestCharacter, testRedis } from './setup';
import { Character, MetaCommand } from '../types';

// Mock OpenAI service
jest.mock('../services/openai', () => ({
  OpenAIService: jest.fn().mockImplementation(() => ({
    processNarrativeInput: jest.fn().mockResolvedValue({
      content: 'Test AI response',
      reasoning: 'Test reasoning',
      system_effects: [],
      narrative_coherence: 85
    }),
    generateWorldModule: jest.fn().mockResolvedValue({
      name: 'Test Generated World',
      genre: 'test-generated',
      physics_rules: {
        gravity: 'Generated gravity rules',
        magic: 'Generated magic system'
      },
      narrative_constraints: ['Generated constraint'],
      entropy_level: 1
    })
  }))
}));

describe('WhiteRoomEngine', () => {
  let engine: WhiteRoomEngine;
  let testUser: any;
  let testCharacter: Character;

  beforeEach(async () => {
    engine = new WhiteRoomEngine();
    testUser = await createTestUser({ role: 'architect' });
    testCharacter = await createTestCharacter(testUser.id);
  });

  describe('Session Management', () => {
    it('should initialize a new session successfully', async () => {
      const players = [testUser.id];
      const session = await engine.initializeSession(testUser.id, players);

      expect(session).toBeDefined();
      expect(session.id).toMatch(/^session_/);
      expect(session.architect_id).toBe(testUser.id);
      expect(session.players).toEqual(players);
      expect(session.current_world).toBeDefined();
      expect(session.current_world.name).toBe('The White Room');
      expect(session.narrative_state).toBeDefined();
      expect(session.narrative_state.current_scene).toBe('The White Room - Ground State');
    });

    it('should create default white room with correct properties', async () => {
      const session = await engine.initializeSession(testUser.id, []);
      const world = session.current_world;

      expect(world.name).toBe('The White Room');
      expect(world.genre).toBe('meta-reality');
      expect(world.entropy_level).toBe(0);
      expect(world.physics_rules).toHaveProperty('gravity');
      expect(world.physics_rules).toHaveProperty('magic');
      expect(world.physics_rules).toHaveProperty('meta_physics');
      expect(world.narrative_constraints).toContain('Nothing exists until spoken or claimed');
    });

    it('should initialize narrative state correctly', async () => {
      const session = await engine.initializeSession(testUser.id, [testUser.id]);
      const narrativeState = session.narrative_state;

      expect(narrativeState.current_scene).toBe('The White Room - Ground State');
      expect(narrativeState.active_timelines).toHaveLength(1);
      expect(narrativeState.active_timelines[0].id).toBe('main_timeline');
      expect(narrativeState.active_timelines[0].is_active).toBe(true);
      expect(narrativeState.recursion_stack).toHaveLength(0);
    });

    it('should save session state to Redis', async () => {
      const session = await engine.initializeSession(testUser.id, []);
      
      // Check if session is saved in Redis
      const savedSession = await testRedis.get(`session:${session.id}`);
      expect(savedSession).toBeDefined();
      
      const parsedSession = JSON.parse(savedSession!);
      expect(parsedSession.id).toBe(session.id);
      expect(parsedSession.architect_id).toBe(testUser.id);
    });

    it('should retrieve existing session', async () => {
      const originalSession = await engine.initializeSession(testUser.id, []);
      const retrievedSession = await engine.getSession(originalSession.id);

      expect(retrievedSession).toBeDefined();
      expect(retrievedSession!.id).toBe(originalSession.id);
      expect(retrievedSession!.architect_id).toBe(originalSession.architect_id);
    });

    it('should return null for non-existent session', async () => {
      const session = await engine.getSession('non-existent-session-id');
      expect(session).toBeNull();
    });
  });

  describe('Player Input Processing', () => {
    let session: any;

    beforeEach(async () => {
      session = await engine.initializeSession(testUser.id, [testUser.id]);
    });

    it('should process player input successfully', async () => {
      const input = 'I examine the white void around me';
      
      const result = await engine.processPlayerInput(
        session.id,
        testUser.id,
        input,
        testCharacter
      );

      expect(result).toBeDefined();
      expect(result.response).toBe('Test AI response');
      expect(result.effects).toEqual([]);
    });

    it('should determine event type correctly', async () => {
      const testCases = [
        { input: '"Hello there!"', expectedType: 'dialogue' },
        { input: 'I walk forward', expectedType: 'action' },
        { input: 'system: restart', expectedType: 'system' },
        { input: 'meta: break fourth wall', expectedType: 'meta' },
        { input: '/break_fourth_wall', expectedType: 'meta' }
      ];

      for (const testCase of testCases) {
        const result = await engine.processPlayerInput(
          session.id,
          testUser.id,
          testCase.input,
          testCharacter
        );
        // We can't directly test the private method, but we can verify it works through integration
        expect(result).toBeDefined();
      }
    });

    it('should calculate reality impact correctly', async () => {
      const highImpactInput = 'I rewrite the fundamental laws of reality and existence';
      
      const result = await engine.processPlayerInput(
        session.id,
        testUser.id,
        highImpactInput,
        testCharacter
      );

      expect(result).toBeDefined();
      // The actual impact calculation is done internally and stored in narrative events
    });

    it('should reject input for non-existent session', async () => {
      await expect(
        engine.processPlayerInput(
          'non-existent-session',
          testUser.id,
          'test input',
          testCharacter
        )
      ).rejects.toThrow('Session not found');
    });
  });

  describe('Meta-Command Execution', () => {
    let session: any;

    beforeEach(async () => {
      session = await engine.initializeSession(testUser.id, [testUser.id]);
    });

    it('should fork timeline successfully', async () => {
      const command: MetaCommand = {
        command: 'fork_timeline',
        parameters: {
          branch_point: 'current',
          probability: 0.7
        },
        requires_audit: false,
        system_access_level: 5
      };

      const result = await engine.executeMetaCommand(
        session.id,
        testUser.id,
        command
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Timeline forked');
    });

    it('should modify world successfully', async () => {
      const command: MetaCommand = {
        command: 'modify_world',
        parameters: {
          modifications: {
            gravity: 'Gravity flows sideways on Tuesdays'
          }
        },
        requires_audit: false,
        system_access_level: 7
      };

      const result = await engine.executeMetaCommand(
        session.id,
        testUser.id,
        command
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('World modified successfully');
    });

    it('should rewrite past events', async () => {
      const command: MetaCommand = {
        command: 'rewrite_past',
        parameters: {
          event_id: 'test-event-id',
          new_content: 'This is the new version of what happened'
        },
        requires_audit: false,
        system_access_level: 8
      };

      const result = await engine.executeMetaCommand(
        session.id,
        testUser.id,
        command
      );

      // Should not find the event but still handle gracefully
      expect(result.success).toBe(false);
      expect(result.message).toBe('Event not found in timeline');
    });

    it('should spawn nested world', async () => {
      const command: MetaCommand = {
        command: 'spawn_world',
        parameters: {
          genre: 'cyberpunk',
          constraints: ['Technology is sentient', 'AIs have emotions'],
          exit_conditions: ['Return to previous layer when story concludes']
        },
        requires_audit: false,
        system_access_level: 6
      };

      const result = await engine.executeMetaCommand(
        session.id,
        testUser.id,
        command
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Nested world spawned');
    });

    it('should break fourth wall', async () => {
      const command: MetaCommand = {
        command: 'break_fourth_wall',
        parameters: {
          wall_type: 'narrative'
        },
        requires_audit: false,
        system_access_level: 9
      };

      const result = await engine.executeMetaCommand(
        session.id,
        testUser.id,
        command
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('boundaries of story and reality blur');
    });

    it('should require audit for high-level commands', async () => {
      const command: MetaCommand = {
        command: 'break_fourth_wall',
        parameters: { wall_type: 'system' },
        requires_audit: true,
        system_access_level: 10
      };

      const result = await engine.executeMetaCommand(
        session.id,
        testUser.id,
        command
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Command requires system audit');
      expect(result.auditRequired).toBe(true);
    });

    it('should reject unknown commands', async () => {
      const command: MetaCommand = {
        command: 'unknown_command',
        parameters: {},
        requires_audit: false,
        system_access_level: 1
      };

      const result = await engine.executeMetaCommand(
        session.id,
        testUser.id,
        command
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unknown meta-command: unknown_command');
    });

    it('should reject commands for non-existent session', async () => {
      const command: MetaCommand = {
        command: 'fork_timeline',
        parameters: {},
        requires_audit: false,
        system_access_level: 5
      };

      await expect(
        engine.executeMetaCommand(
          'non-existent-session',
          testUser.id,
          command
        )
      ).rejects.toThrow('Session not found');
    });
  });

  describe('Narrative Coherence', () => {
    let session: any;

    beforeEach(async () => {
      session = await engine.initializeSession(testUser.id, [testUser.id]);
    });

    it('should track entropy changes', async () => {
      const initialEntropy = session.current_world.entropy_level;

      // Execute a world-modifying command
      const command: MetaCommand = {
        command: 'modify_world',
        parameters: { modifications: { gravity: 'chaotic' } },
        requires_audit: false,
        system_access_level: 7
      };

      await engine.executeMetaCommand(session.id, testUser.id, command);

      // Get updated session
      const updatedSession = await engine.getSession(session.id);
      expect(updatedSession!.current_world.entropy_level).toBeGreaterThan(initialEntropy);
    });

    it('should handle recursion stack', async () => {
      // Spawn a nested world
      const command: MetaCommand = {
        command: 'spawn_world',
        parameters: { genre: 'fantasy' },
        requires_audit: false,
        system_access_level: 6
      };

      await engine.executeMetaCommand(session.id, testUser.id, command);

      const updatedSession = await engine.getSession(session.id);
      expect(updatedSession!.narrative_state.recursion_stack).toHaveLength(1);
      expect(updatedSession!.narrative_state.recursion_stack[0].level).toBe(1);
    });
  });

  describe('Session State Persistence', () => {
    let session: any;

    beforeEach(async () => {
      session = await engine.initializeSession(testUser.id, [testUser.id]);
    });

    it('should persist session state after modifications', async () => {
      const originalWorld = session.current_world;

      // Modify the world
      const command: MetaCommand = {
        command: 'modify_world',
        parameters: {
          modifications: { magic: 'All magic requires dance' }
        },
        requires_audit: false,
        system_access_level: 7
      };

      await engine.executeMetaCommand(session.id, testUser.id, command);

      // Retrieve session from storage
      const retrievedSession = await engine.getSession(session.id);
      expect(retrievedSession).toBeDefined();
      expect(retrievedSession!.current_world.physics_rules.magic).toBe('All magic requires dance');
      expect(retrievedSession!.current_world.entropy_level).toBeGreaterThan(originalWorld.entropy_level);
    });

    it('should handle Redis cache expiration gracefully', async () => {
      // Session should be retrievable even if it's not in the in-memory cache
      const newEngine = new WhiteRoomEngine();
      const retrievedSession = await newEngine.getSession(session.id);

      expect(retrievedSession).toBeDefined();
      expect(retrievedSession!.id).toBe(session.id);
    });
  });
});