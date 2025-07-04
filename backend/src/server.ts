import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

import { initializeDatabase } from '@/config/database';
import { WhiteRoomEngine } from '@/services/whiteroom-engine';
import { OpenAIService } from '@/services/openai';
import { authRoutes } from '@/routes/auth';
import { characterRoutes } from '@/routes/characters';
import { worldRoutes } from '@/routes/worlds';
import { gameRoutes } from '@/routes/game';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize services
const whiteRoomEngine = new WhiteRoomEngine();
const openaiService = new OpenAIService();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/worlds', worldRoutes);
app.use('/api/game', gameRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    socket.data.userId = decoded.userId;
    socket.data.role = decoded.role;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.data.userId}`);
  
  // Join game session
  socket.on('join_session', async (sessionId: string) => {
    try {
      const session = await whiteRoomEngine.getSession(sessionId);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }
      
      // Check if user is allowed in this session
      if (session.architect_id !== socket.data.userId && 
          !session.players.includes(socket.data.userId)) {
        socket.emit('error', { message: 'Not authorized for this session' });
        return;
      }
      
      socket.join(sessionId);
      socket.emit('session_joined', { sessionId, session });
      socket.to(sessionId).emit('player_joined', { userId: socket.data.userId });
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to join session' });
    }
  });
  
  // Handle player input
  socket.on('player_input', async (data: { 
    sessionId: string, 
    input: string, 
    character: any 
  }) => {
    try {
      const result = await whiteRoomEngine.processPlayerInput(
        data.sessionId,
        socket.data.userId,
        data.input,
        data.character
      );
      
      // Emit to all players in the session
      io.to(data.sessionId).emit('narrative_update', {
        playerId: socket.data.userId,
        input: data.input,
        response: result.response,
        effects: result.effects,
        timestamp: new Date()
      });
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to process input' });
    }
  });
  
  // Handle meta commands
  socket.on('meta_command', async (data: { 
    sessionId: string, 
    command: any 
  }) => {
    try {
      const result = await whiteRoomEngine.executeMetaCommand(
        data.sessionId,
        socket.data.userId,
        data.command
      );
      
      if (result.auditRequired) {
        // Emit audit request to architect
        const session = await whiteRoomEngine.getSession(data.sessionId);
        if (session) {
          io.to(session.architect_id).emit('audit_request', {
            sessionId: data.sessionId,
            playerId: socket.data.userId,
            command: data.command
          });
        }
      } else {
        // Emit result to all players
        io.to(data.sessionId).emit('meta_command_result', {
          playerId: socket.data.userId,
          command: data.command,
          result: result,
          timestamp: new Date()
        });
      }
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to execute meta command' });
    }
  });
  
  // Handle architect commands
  socket.on('architect_command', async (data: { 
    sessionId: string, 
    command: string, 
    parameters: any 
  }) => {
    try {
      // Only architects can use architect commands
      if (socket.data.role !== 'architect') {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }
      
      const session = await whiteRoomEngine.getSession(data.sessionId);
      if (!session || session.architect_id !== socket.data.userId) {
        socket.emit('error', { message: 'Not authorized for this session' });
        return;
      }
      
      // Handle architect-specific commands
      switch (data.command) {
        case 'modify_world':
          // Architect can directly modify world without audit
          const result = await whiteRoomEngine.executeMetaCommand(
            data.sessionId,
            socket.data.userId,
            { 
              command: 'modify_world', 
              parameters: data.parameters,
              requires_audit: false,
              system_access_level: 10
            }
          );
          
          io.to(data.sessionId).emit('world_modified', {
            architect: socket.data.userId,
            modifications: data.parameters,
            result: result,
            timestamp: new Date()
          });
          break;
          
        case 'spawn_npc':
          // Generate AI NPC
          const npcData = await openaiService.generateCharacterSheet(
            data.parameters.backstory || 'A mysterious figure in the White Room',
            data.parameters.personality || 'Enigmatic and helpful',
            data.parameters.domainWeights || {}
          );
          
          io.to(data.sessionId).emit('npc_spawned', {
            npc: npcData,
            spawnLocation: data.parameters.location || 'current scene',
            timestamp: new Date()
          });
          break;
          
        default:
          socket.emit('error', { message: 'Unknown architect command' });
      }
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to execute architect command' });
    }
  });
  
  // Handle audit responses
  socket.on('audit_response', async (data: { 
    sessionId: string, 
    auditId: string, 
    approved: boolean, 
    reasoning: string,
    modifications?: any
  }) => {
    try {
      if (socket.data.role !== 'architect') {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }
      
      io.to(data.sessionId).emit('audit_resolved', {
        auditId: data.auditId,
        approved: data.approved,
        reasoning: data.reasoning,
        modifications: data.modifications,
        timestamp: new Date()
      });
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to process audit response' });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.data.userId}`);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    server.listen(PORT, () => {
      console.log(`WhiteRoom.exe server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer();