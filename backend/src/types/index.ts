export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'player' | 'architect';
  created_at: Date;
  updated_at: Date;
}

export interface Character {
  id: string;
  user_id: string;
  name: string;
  personality_kernel: PersonalityKernel;
  backstory: string;
  stats: CharacterStats;
  meta_skills: MetaSkill[];
  created_at: Date;
  updated_at: Date;
}

export interface PersonalityKernel {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  domain_weights: Record<string, number>;
  training_context: string;
}

export interface CharacterStats {
  narrative_coherence: number;
  reality_anchor: number;
  recursion_depth: number;
  fourth_wall_permeability: number;
}

export interface MetaSkill {
  name: string;
  type: 'loopback' | 'fork_thread' | 'editor_access' | 'system_audit';
  level: number;
  description: string;
}

export interface GameSession {
  id: string;
  architect_id: string;
  players: string[];
  current_world: WorldModule;
  narrative_state: NarrativeState;
  created_at: Date;
  updated_at: Date;
}

export interface WorldModule {
  id: string;
  name: string;
  genre: string;
  parent_world_id?: string;
  nested_worlds: string[];
  physics_rules: Record<string, any>;
  narrative_constraints: string[];
  entropy_level: number;
  created_by: string;
}

export interface NarrativeState {
  current_scene: string;
  active_timelines: Timeline[];
  character_states: Record<string, any>;
  world_consistency: Record<string, boolean>;
  recursion_stack: RecursionFrame[];
}

export interface Timeline {
  id: string;
  branch_point: string;
  events: NarrativeEvent[];
  probability: number;
  is_active: boolean;
}

export interface NarrativeEvent {
  id: string;
  type: 'action' | 'dialogue' | 'system' | 'meta';
  actor_id: string;
  content: string;
  timestamp: Date;
  reality_impact: number;
}

export interface RecursionFrame {
  level: number;
  world_id: string;
  entry_point: string;
  modified_rules: Record<string, any>;
  exit_conditions: string[];
}

export interface AIResponse {
  content: string;
  reasoning: string;
  system_effects: SystemEffect[];
  narrative_coherence: number;
}

export interface SystemEffect {
  type: 'world_change' | 'character_update' | 'timeline_fork' | 'meta_command';
  target: string;
  changes: Record<string, any>;
}

export interface MetaCommand {
  command: string;
  parameters: Record<string, any>;
  requires_audit: boolean;
  system_access_level: number;
}

export interface SystemAudit {
  id: string;
  initiator_id: string;
  command: MetaCommand;
  ai_justification: string;
  player_justification: string;
  resolution: 'approved' | 'denied' | 'modified';
  modifications?: Record<string, any>;
}