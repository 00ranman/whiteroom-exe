import express from 'express';
import { pool } from '@/config/database';
import { WhiteRoomEngine } from '@/services/whiteroom-engine';
import { authMiddleware } from '@/middleware/auth';
import { GameSession } from '@/types';

const router = express.Router();
const whiteRoomEngine = new WhiteRoomEngine();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Create new game session
router.post('/sessions', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { players } = req.body;
    
    // Only architects can create sessions
    if (req.user.role !== 'architect') {
      return res.status(403).json({ error: 'Only architects can create game sessions' });
    }
    
    // Validate players array
    if (!Array.isArray(players)) {
      return res.status(400).json({ error: 'Players must be an array' });
    }
    
    // Create session using WhiteRoom engine
    const session = await whiteRoomEngine.initializeSession(userId, players);
    
    // Save to database
    const result = await pool.query(
      `INSERT INTO game_sessions (id, architect_id, players, current_world, narrative_state)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        session.id,
        session.architect_id,
        JSON.stringify(session.players),
        JSON.stringify(session.current_world),
        JSON.stringify(session.narrative_state)
      ]
    );
    
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create game session' });
  }
});

// Get user's game sessions
router.get('/sessions', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await pool.query(
      `SELECT * FROM game_sessions 
       WHERE architect_id = $1 OR $1 = ANY(players::text[]::uuid[])
       ORDER BY created_at DESC`,
      [userId]
    );
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific session
router.get('/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const result = await pool.query(
      `SELECT * FROM game_sessions 
       WHERE id = $1 AND (architect_id = $2 OR $2 = ANY(players::text[]::uuid[]))`,
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or not authorized' });
    }
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update session
router.put('/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { current_world, narrative_state } = req.body;
    
    // Check if user is the architect
    const session = await pool.query(
      'SELECT * FROM game_sessions WHERE id = $1 AND architect_id = $2',
      [id, userId]
    );
    
    if (session.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or not authorized' });
    }
    
    // Update session
    const result = await pool.query(
      `UPDATE game_sessions 
       SET current_world = COALESCE($1, current_world),
           narrative_state = COALESCE($2, narrative_state),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [
        current_world ? JSON.stringify(current_world) : null,
        narrative_state ? JSON.stringify(narrative_state) : null,
        id
      ]
    );
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete session
router.delete('/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Only architect can delete session
    const result = await pool.query(
      'DELETE FROM game_sessions WHERE id = $1 AND architect_id = $2 RETURNING id',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or not authorized' });
    }
    
    res.json({ message: 'Session deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get session narrative events
router.get('/sessions/:id/events', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;
    
    // Check if user has access to session
    const session = await pool.query(
      `SELECT id FROM game_sessions 
       WHERE id = $1 AND (architect_id = $2 OR $2 = ANY(players::text[]::uuid[]))`,
      [id, userId]
    );
    
    if (session.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or not authorized' });
    }
    
    // Get events
    const events = await pool.query(
      `SELECT e.*, u.username as actor_name 
       FROM narrative_events e
       JOIN users u ON e.actor_id = u.id
       WHERE e.session_id = $1 
       ORDER BY e.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );
    
    res.json(events.rows);
    
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add narrative event
router.post('/sessions/:id/events', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { type, content, reality_impact = 0.0 } = req.body;
    
    // Check if user has access to session
    const session = await pool.query(
      `SELECT id FROM game_sessions 
       WHERE id = $1 AND (architect_id = $2 OR $2 = ANY(players::text[]::uuid[]))`,
      [id, userId]
    );
    
    if (session.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or not authorized' });
    }
    
    // Validate event type
    if (!['action', 'dialogue', 'system', 'meta'].includes(type)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }
    
    // Create event
    const result = await pool.query(
      `INSERT INTO narrative_events (session_id, type, actor_id, content, reality_impact)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, type, userId, content, reality_impact]
    );
    
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create narrative event' });
  }
});

// Get system audits for session
router.get('/sessions/:id/audits', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Check if user has access to session
    const session = await pool.query(
      `SELECT id FROM game_sessions 
       WHERE id = $1 AND (architect_id = $2 OR $2 = ANY(players::text[]::uuid[]))`,
      [id, userId]
    );
    
    if (session.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or not authorized' });
    }
    
    // Get audits
    const audits = await pool.query(
      `SELECT a.*, u.username as initiator_name 
       FROM system_audits a
       JOIN users u ON a.initiator_id = u.id
       WHERE a.session_id = $1 
       ORDER BY a.created_at DESC`,
      [id]
    );
    
    res.json(audits.rows);
    
  } catch (error) {
    console.error('Error fetching audits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create system audit
router.post('/sessions/:id/audits', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { command, player_justification } = req.body;
    
    // Check if user has access to session
    const session = await pool.query(
      `SELECT id FROM game_sessions 
       WHERE id = $1 AND (architect_id = $2 OR $2 = ANY(players::text[]::uuid[]))`,
      [id, userId]
    );
    
    if (session.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or not authorized' });
    }
    
    // Create audit
    const result = await pool.query(
      `INSERT INTO system_audits (session_id, initiator_id, command, player_justification)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, userId, JSON.stringify(command), player_justification]
    );
    
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Error creating audit:', error);
    res.status(500).json({ error: 'Failed to create system audit' });
  }
});

// Resolve system audit
router.put('/sessions/:sessionId/audits/:auditId', async (req, res) => {
  try {
    const { sessionId, auditId } = req.params;
    const userId = req.user.userId;
    const { resolution, ai_justification, modifications } = req.body;
    
    // Check if user is the architect of the session
    const session = await pool.query(
      'SELECT id FROM game_sessions WHERE id = $1 AND architect_id = $2',
      [sessionId, userId]
    );
    
    if (session.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or not authorized' });
    }
    
    // Validate resolution
    if (!['approved', 'denied', 'modified'].includes(resolution)) {
      return res.status(400).json({ error: 'Invalid resolution' });
    }
    
    // Update audit
    const result = await pool.query(
      `UPDATE system_audits 
       SET resolution = $1, 
           ai_justification = $2, 
           modifications = $3, 
           resolved_at = NOW()
       WHERE id = $4 AND session_id = $5
       RETURNING *`,
      [
        resolution,
        ai_justification,
        modifications ? JSON.stringify(modifications) : null,
        auditId,
        sessionId
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Audit not found' });
    }
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Error resolving audit:', error);
    res.status(500).json({ error: 'Failed to resolve system audit' });
  }
});

// Get session statistics
router.get('/sessions/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Check if user has access to session
    const session = await pool.query(
      `SELECT * FROM game_sessions 
       WHERE id = $1 AND (architect_id = $2 OR $2 = ANY(players::text[]::uuid[]))`,
      [id, userId]
    );
    
    if (session.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or not authorized' });
    }
    
    // Get statistics
    const [eventStats, auditStats] = await Promise.all([
      pool.query(
        `SELECT type, COUNT(*) as count, AVG(reality_impact) as avg_impact
         FROM narrative_events 
         WHERE session_id = $1 
         GROUP BY type`,
        [id]
      ),
      pool.query(
        `SELECT resolution, COUNT(*) as count
         FROM system_audits 
         WHERE session_id = $1 
         GROUP BY resolution`,
        [id]
      )
    ]);
    
    const sessionData = session.rows[0];
    const narrativeState = JSON.parse(sessionData.narrative_state);
    const currentWorld = JSON.parse(sessionData.current_world);
    
    res.json({
      session_id: id,
      duration: new Date().getTime() - new Date(sessionData.created_at).getTime(),
      event_statistics: eventStats.rows,
      audit_statistics: auditStats.rows,
      narrative_state: {
        active_timelines: narrativeState.active_timelines?.length || 0,
        recursion_depth: narrativeState.recursion_stack?.length || 0,
        entropy_level: currentWorld.entropy_level || 0
      },
      player_count: sessionData.players?.length || 0
    });
    
  } catch (error) {
    console.error('Error fetching session stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as gameRoutes };