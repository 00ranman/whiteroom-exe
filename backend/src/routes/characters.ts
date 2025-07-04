import express from 'express';
import { pool } from '@/config/database';
import { OpenAIService } from '@/services/openai';
import { authMiddleware } from '@/middleware/auth';
import { Character } from '@/types';

const router = express.Router();
const openaiService = new OpenAIService();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get user's characters
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await pool.query(
      'SELECT * FROM characters WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific character
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const result = await pool.query(
      'SELECT * FROM characters WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new character
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { backstory, personalityTraits, domainWeights } = req.body;
    
    // Validate input
    if (!backstory || !personalityTraits) {
      return res.status(400).json({ error: 'Backstory and personality traits are required' });
    }
    
    // Generate character using AI
    const character = await openaiService.generateCharacterSheet(
      backstory,
      personalityTraits,
      domainWeights || {}
    );
    
    // Save to database
    const result = await pool.query(
      `INSERT INTO characters (user_id, name, personality_kernel, backstory, stats, meta_skills)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        character.name,
        JSON.stringify(character.personality_kernel),
        character.backstory,
        JSON.stringify(character.stats),
        JSON.stringify(character.meta_skills)
      ]
    );
    
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
});

// Update character
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { name, backstory, stats, meta_skills } = req.body;
    
    // Check if character exists and belongs to user
    const existingCharacter = await pool.query(
      'SELECT * FROM characters WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (existingCharacter.rows.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Update character
    const result = await pool.query(
      `UPDATE characters 
       SET name = COALESCE($1, name),
           backstory = COALESCE($2, backstory),
           stats = COALESCE($3, stats),
           meta_skills = COALESCE($4, meta_skills),
           updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [
        name,
        backstory,
        stats ? JSON.stringify(stats) : null,
        meta_skills ? JSON.stringify(meta_skills) : null,
        id,
        userId
      ]
    );
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete character
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const result = await pool.query(
      'DELETE FROM characters WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json({ message: 'Character deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate character image
router.post('/:id/image', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Get character
    const result = await pool.query(
      'SELECT * FROM characters WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    const character = result.rows[0];
    
    // Generate image
    const imageUrl = await openaiService.generateCharacterImage({
      ...character,
      personality_kernel: JSON.parse(character.personality_kernel),
      stats: JSON.parse(character.stats),
      meta_skills: JSON.parse(character.meta_skills)
    });
    
    res.json({ imageUrl });
    
  } catch (error) {
    console.error('Error generating character image:', error);
    res.status(500).json({ error: 'Failed to generate character image' });
  }
});

// Train character personality (advanced AI features)
router.post('/:id/train', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { trainingData, focusAreas } = req.body;
    
    // Get character
    const result = await pool.query(
      'SELECT * FROM characters WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    const character = result.rows[0];
    const personalityKernel = JSON.parse(character.personality_kernel);
    
    // Update domain weights based on training
    if (trainingData && focusAreas) {
      focusAreas.forEach((area: string) => {
        personalityKernel.domain_weights[area] = 
          (personalityKernel.domain_weights[area] || 0) + 0.1;
      });
    }
    
    // Update training context
    personalityKernel.training_context += `\n\nTraining Update: ${trainingData}`;
    
    // Save updated personality kernel
    await pool.query(
      'UPDATE characters SET personality_kernel = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(personalityKernel), id]
    );
    
    res.json({ 
      message: 'Character personality updated',
      updatedKernel: personalityKernel
    });
    
  } catch (error) {
    console.error('Error training character:', error);
    res.status(500).json({ error: 'Failed to train character' });
  }
});

export { router as characterRoutes };