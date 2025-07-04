import { Pool, PoolConfig } from 'pg';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const poolConfig: PoolConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'whiteroom_db',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

export const initializeDatabase = async () => {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL database');
    
    await redisClient.connect();
    console.log('Connected to Redis');
    
    await createTables();
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

const createTables = async () => {
  const client = await pool.connect();
  
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
      
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
      CREATE INDEX IF NOT EXISTS idx_world_modules_parent ON world_modules(parent_world_id);
      CREATE INDEX IF NOT EXISTS idx_game_sessions_architect ON game_sessions(architect_id);
      CREATE INDEX IF NOT EXISTS idx_narrative_events_session ON narrative_events(session_id);
      CREATE INDEX IF NOT EXISTS idx_system_audits_session ON system_audits(session_id);
    `);
  } finally {
    client.release();
  }
};