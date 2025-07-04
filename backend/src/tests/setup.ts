import { Pool } from 'pg';
import { createClient } from 'redis';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Test database setup
export const testPool = new Pool({
  host: process.env.TEST_DATABASE_HOST || 'localhost',
  port: parseInt(process.env.TEST_DATABASE_PORT || '5432'),
  database: process.env.TEST_DATABASE_NAME || 'whiteroom_test',
  user: process.env.TEST_DATABASE_USER || 'postgres',
  password: process.env.TEST_DATABASE_PASSWORD || 'password',
});

// Test Redis setup
export const testRedis = createClient({
  url: process.env.TEST_REDIS_URL || 'redis://localhost:6379/1',
});

// Global test setup
beforeAll(async () => {
  // Connect to test database
  await testPool.connect();
  
  // Connect to test Redis
  await testRedis.connect();
  
  // Create test tables
  await createTestTables();
});

// Global test cleanup
afterAll(async () => {
  // Clean up test data
  await cleanupTestData();
  
  // Close connections
  await testPool.end();
  await testRedis.quit();
});

// Clean up after each test
afterEach(async () => {
  // Clear Redis
  await testRedis.flushDb();
  
  // Clear database tables (but keep schema)
  await testPool.query('TRUNCATE users, characters, world_modules, game_sessions, narrative_events, system_audits CASCADE');
});

async function createTestTables() {
  const client = await testPool.connect();
  
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('player', 'architect')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS characters (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        personality_kernel JSONB NOT NULL,
        backstory TEXT,
        stats JSONB NOT NULL,
        meta_skills JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS world_modules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        genre VARCHAR(100) NOT NULL,
        parent_world_id UUID REFERENCES world_modules(id) ON DELETE CASCADE,
        nested_worlds JSONB NOT NULL DEFAULT '[]',
        physics_rules JSONB NOT NULL DEFAULT '{}',
        narrative_constraints JSONB NOT NULL DEFAULT '[]',
        entropy_level INTEGER NOT NULL DEFAULT 0,
        created_by UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS game_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        architect_id UUID REFERENCES users(id) ON DELETE CASCADE,
        players JSONB NOT NULL DEFAULT '[]',
        current_world JSONB NOT NULL,
        narrative_state JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS narrative_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('action', 'dialogue', 'system', 'meta')),
        actor_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        reality_impact DECIMAL(3,2) NOT NULL DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS system_audits (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
        initiator_id UUID REFERENCES users(id) ON DELETE CASCADE,
        command JSONB NOT NULL,
        ai_justification TEXT,
        player_justification TEXT,
        resolution VARCHAR(20) CHECK (resolution IN ('approved', 'denied', 'modified')),
        modifications JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP
      );
    `);
  } finally {
    client.release();
  }
}

async function cleanupTestData() {
  const client = await testPool.connect();
  
  try {
    await client.query(`
      DROP TABLE IF EXISTS system_audits CASCADE;
      DROP TABLE IF EXISTS narrative_events CASCADE;
      DROP TABLE IF EXISTS game_sessions CASCADE;
      DROP TABLE IF EXISTS world_modules CASCADE;
      DROP TABLE IF EXISTS characters CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
  } finally {
    client.release();
  }
}

// Test utilities
export const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    username: `testuser_${Math.random().toString(36).substr(2, 9)}`,
    email: `test_${Math.random().toString(36).substr(2, 9)}@example.com`,
    password_hash: '$2a$12$test.hash.here',
    role: 'player'
  };
  
  const userData = { ...defaultUser, ...overrides };
  
  const result = await testPool.query(
    'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [userData.username, userData.email, userData.password_hash, userData.role]
  );
  
  return result.rows[0];
};

export const createTestCharacter = async (userId: string, overrides = {}) => {
  const defaultCharacter = {
    name: 'Test Character',
    personality_kernel: {
      openness: 75,
      conscientiousness: 80,
      extraversion: 60,
      agreeableness: 70,
      neuroticism: 40,
      domain_weights: {
        combat: 0.5,
        social: 0.7,
        technology: 0.3,
        meta: 0.6
      },
      training_context: 'Test character context'
    },
    backstory: 'A test character created for testing purposes',
    stats: {
      narrative_coherence: 85,
      reality_anchor: 75,
      recursion_depth: 2,
      fourth_wall_permeability: 60
    },
    meta_skills: [
      {
        name: 'Test Skill',
        type: 'loopback',
        level: 3,
        description: 'A test meta-skill'
      }
    ]
  };
  
  const characterData = { ...defaultCharacter, ...overrides };
  
  const result = await testPool.query(
    'INSERT INTO characters (user_id, name, personality_kernel, backstory, stats, meta_skills) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [
      userId,
      characterData.name,
      JSON.stringify(characterData.personality_kernel),
      characterData.backstory,
      JSON.stringify(characterData.stats),
      JSON.stringify(characterData.meta_skills)
    ]
  );
  
  return result.rows[0];
};

export const createTestWorld = async (createdBy: string, overrides = {}) => {
  const defaultWorld = {
    name: 'Test World',
    genre: 'test-fantasy',
    physics_rules: {
      gravity: 'Normal downward force',
      magic: 'Spell-based reality manipulation',
      technology: 'Medieval with magical enhancements'
    },
    narrative_constraints: [
      'Magic requires incantations',
      'Technology is limited to medieval level'
    ],
    entropy_level: 0
  };
  
  const worldData = { ...defaultWorld, ...overrides };
  
  const result = await testPool.query(
    'INSERT INTO world_modules (name, genre, physics_rules, narrative_constraints, entropy_level, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [
      worldData.name,
      worldData.genre,
      JSON.stringify(worldData.physics_rules),
      JSON.stringify(worldData.narrative_constraints),
      worldData.entropy_level,
      createdBy
    ]
  );
  
  return result.rows[0];
};

export const createTestSession = async (architectId: string, overrides = {}) => {
  const defaultSession = {
    players: [],
    current_world: {
      id: 'test-world',
      name: 'Test World',
      genre: 'test',
      entropy_level: 0,
      physics_rules: {},
      narrative_constraints: []
    },
    narrative_state: {
      current_scene: 'Test Scene',
      active_timelines: [{
        id: 'main',
        branch_point: 'start',
        events: [],
        probability: 1.0,
        is_active: true
      }],
      character_states: {},
      world_consistency: {},
      recursion_stack: []
    }
  };
  
  const sessionData = { ...defaultSession, ...overrides };
  
  const result = await testPool.query(
    'INSERT INTO game_sessions (architect_id, players, current_world, narrative_state) VALUES ($1, $2, $3, $4) RETURNING *',
    [
      architectId,
      JSON.stringify(sessionData.players),
      JSON.stringify(sessionData.current_world),
      JSON.stringify(sessionData.narrative_state)
    ]
  );
  
  return result.rows[0];
};