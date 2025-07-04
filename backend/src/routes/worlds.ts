import express from 'express';
import { pool } from '@/config/database';
import { OpenAIService } from '@/services/openai';
import { authMiddleware } from '@/middleware/auth';
import { WorldModule } from '@/types';

const router = express.Router();
const openaiService = new OpenAIService();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get user's world modules
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await pool.query(
      'SELECT * FROM world_modules WHERE created_by = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error fetching worlds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get public world modules
router.get('/public', async (req, res) => {
  try {
    // For now, return all worlds (in production, add public/private flag)
    const result = await pool.query(
      'SELECT id, name, genre, entropy_level, created_at FROM world_modules ORDER BY created_at DESC LIMIT 50'
    );
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error fetching public worlds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific world module
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM world_modules WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'World module not found' });
    }
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Error fetching world:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new world module
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { genre, parentWorldId, constraints } = req.body;
    
    // Validate input
    if (!genre) {
      return res.status(400).json({ error: 'Genre is required' });
    }
    
    // Get parent world context if provided
    let parentWorld = null;
    if (parentWorldId) {
      const parentResult = await pool.query(
        'SELECT * FROM world_modules WHERE id = $1',
        [parentWorldId]
      );
      
      if (parentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Parent world not found' });
      }
      
      parentWorld = parentResult.rows[0];
    }
    
    // Generate world using AI
    const worldData = await openaiService.generateWorldModule(
      genre,
      parentWorld ? parentWorld.name : undefined,
      constraints || []
    );
    
    // Save to database
    const result = await pool.query(
      `INSERT INTO world_modules (name, genre, parent_world_id, nested_worlds, physics_rules, narrative_constraints, entropy_level, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        worldData.name,
        worldData.genre,
        parentWorldId || null,
        JSON.stringify(worldData.nested_worlds || []),
        JSON.stringify(worldData.physics_rules),
        JSON.stringify(worldData.narrative_constraints),
        worldData.entropy_level,
        userId
      ]
    );
    
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Error creating world:', error);
    res.status(500).json({ error: 'Failed to create world module' });
  }
});

// Update world module
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { name, physics_rules, narrative_constraints, entropy_level } = req.body;
    
    // Check if user owns the world or is an architect
    const existingWorld = await pool.query(
      'SELECT * FROM world_modules WHERE id = $1 AND (created_by = $2 OR EXISTS (SELECT 1 FROM users WHERE id = $2 AND role = \'architect\'))',
      [id, userId]
    );
    
    if (existingWorld.rows.length === 0) {
      return res.status(404).json({ error: 'World module not found or not authorized' });
    }
    
    // Update world
    const result = await pool.query(
      `UPDATE world_modules 
       SET name = COALESCE($1, name),
           physics_rules = COALESCE($2, physics_rules),
           narrative_constraints = COALESCE($3, narrative_constraints),
           entropy_level = COALESCE($4, entropy_level),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [
        name,
        physics_rules ? JSON.stringify(physics_rules) : null,
        narrative_constraints ? JSON.stringify(narrative_constraints) : null,
        entropy_level,
        id
      ]
    );
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Error updating world:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete world module
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Check if user owns the world
    const result = await pool.query(
      'DELETE FROM world_modules WHERE id = $1 AND created_by = $2 RETURNING id',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'World module not found or not authorized' });
    }
    
    res.json({ message: 'World module deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting world:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get nested worlds
router.get('/:id/nested', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM world_modules WHERE parent_world_id = $1 ORDER BY created_at DESC',
      [id]
    );
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error fetching nested worlds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clone world module
router.post('/:id/clone', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { newName } = req.body;
    
    // Get original world
    const originalWorld = await pool.query(
      'SELECT * FROM world_modules WHERE id = $1',
      [id]
    );
    
    if (originalWorld.rows.length === 0) {
      return res.status(404).json({ error: 'World module not found' });
    }
    
    const world = originalWorld.rows[0];
    
    // Create clone
    const result = await pool.query(
      `INSERT INTO world_modules (name, genre, parent_world_id, nested_worlds, physics_rules, narrative_constraints, entropy_level, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        newName || `${world.name} (Clone)`,
        world.genre,
        world.parent_world_id,
        world.nested_worlds,
        world.physics_rules,
        world.narrative_constraints,
        0, // Reset entropy level for clone
        userId
      ]
    );
    
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Error cloning world:', error);
    res.status(500).json({ error: 'Failed to clone world module' });
  }
});

// Generate world expansion
router.post('/:id/expand', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { direction, theme } = req.body;
    
    // Get original world
    const originalWorld = await pool.query(
      'SELECT * FROM world_modules WHERE id = $1',
      [id]
    );
    
    if (originalWorld.rows.length === 0) {
      return res.status(404).json({ error: 'World module not found' });
    }
    
    const world = originalWorld.rows[0];
    
    // Generate expansion using AI
    const expansionData = await openaiService.generateWorldModule(
      `${world.genre} expansion - ${theme}`,
      world.name,
      [`Expansion direction: ${direction}`, `Theme: ${theme}`]
    );
    
    // Create expansion as nested world
    const result = await pool.query(
      `INSERT INTO world_modules (name, genre, parent_world_id, nested_worlds, physics_rules, narrative_constraints, entropy_level, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        expansionData.name,
        expansionData.genre,
        id, // Parent world ID
        JSON.stringify([]),
        JSON.stringify(expansionData.physics_rules),
        JSON.stringify(expansionData.narrative_constraints),
        expansionData.entropy_level,
        userId
      ]
    );
    
    // Update parent world's nested_worlds array
    const nestedWorlds = JSON.parse(world.nested_worlds || '[]');
    nestedWorlds.push(result.rows[0].id);
    
    await pool.query(
      'UPDATE world_modules SET nested_worlds = $1 WHERE id = $2',
      [JSON.stringify(nestedWorlds), id]
    );
    
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Error expanding world:', error);
    res.status(500).json({ error: 'Failed to expand world module' });
  }
});

export { router as worldRoutes };