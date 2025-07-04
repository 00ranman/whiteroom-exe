# WhiteRoom.exe - The Recursive RPG

An AI-native roleplaying matrix where reality is uploaded, not assumed. You are not entering a fantasy. You are generating it.

## 🎮 Game Concept

WhiteRoom.exe is the first truly AI-native RPG system that breaks the fourth wall as a core game mechanic. Players jack into a procedural simulation-space hosted on a living AI architecture where:

- **Nothing exists until spoken** - The white void is the default state where reality bootstraps from player intent
- **Characters are AI personalities** - Your character sheet is a trained AI kernel with personality traits and meta-skills
- **Recursive world building** - Spawn nested universes (cyberpunk inside pirate inside eldritch horror)
- **Meta-commands as gameplay** - Direct system access and fourth wall breaking are legitimate game mechanics
- **Narrative entropy** - Contradictions collapse probability waves and increase world instability

## 🏗️ Architecture

### Backend (Node.js + TypeScript)
- **Express API server** with JWT authentication
- **Socket.io** for real-time gameplay communication
- **PostgreSQL** database with comprehensive game state tracking
- **Redis** for session management and caching
- **OpenAI GPT-4.1** integration for AI-driven content generation

### Frontend (React + TypeScript)
- **Vite** build system with hot reload
- **Tailwind CSS** with custom matrix/cyberpunk theme
- **Zustand** for state management
- **Socket.io client** for real-time updates
- **Framer Motion** for smooth animations

### AI Integration
- **Character Generation** - AI creates personality kernels with Big 5 traits
- **World Module Creation** - Procedural reality frameworks with physics rules
- **Narrative Processing** - Real-time story analysis and coherence tracking
- **Meta-Command Evaluation** - AI-mediated system audits for fourth wall breaking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/whiteroom-exe.git
   cd whiteroom-exe
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Configure environment**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your database and OpenAI credentials
   
   # Frontend (optional)
   cd ../frontend
   echo "VITE_API_URL=http://localhost:3001/api" > .env
   echo "VITE_SOCKET_URL=http://localhost:3001" >> .env
   ```

4. **Database setup**
   ```bash
   # Create PostgreSQL database
   createdb whiteroom_db
   
   # Start Redis (varies by OS)
   redis-server
   ```

5. **Start development servers**
   ```bash
   # From project root - starts both backend and frontend
   npm run dev
   
   # Or individually:
   npm run server:dev  # Backend on :3001
   npm run client:dev  # Frontend on :3000
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🎯 Core Game Mechanics

### The White Room
The default state - an infinite white void where nothing exists until claimed by narrative assertion. This is the only place where players can:
- Rewrite their past
- Negotiate with the AI directly
- Spawn or kill gods by refuting their logic

### Character System
Characters are AI personality kernels with:
- **Big 5 Personality Traits** (Openness, Conscientiousness, etc.)
- **Domain Weights** (Combat, Social, Technology, Meta, etc.)
- **Meta-Skills** (Loopback, Fork Thread, Editor Access, System Audit)
- **Coherence Ratings** that determine meta-command power

### World Modules
Recursive reality frameworks that can be nested infinitely:
- **Physics Rules** define what's possible in each layer
- **Narrative Constraints** maintain story coherence
- **Entropy Levels** track reality stability
- **Genre Blending** allows cyberpunk→pirate→horror→cartoon progressions

### Meta-Command System
Fourth wall breaking as legitimate gameplay:
- **System Audits** - Player-AI negotiations for reality changes
- **Timeline Forks** - Create alternate narrative branches
- **Past Rewriting** - Modify previous events with entropy cost
- **World Spawning** - Generate nested reality layers

## 🎭 Player Roles

### Player
- Generate AI personality kernels
- Navigate recursive narrative matrices
- Execute meta-commands within coherence limits
- Collaborate in shared storytelling

### Architect
- Create and manage game sessions
- Direct world manipulation without audits
- Spawn AI NPCs and narrative events
- Monitor system stability and entropy

## 📡 API Documentation

### Authentication
```typescript
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/verify
```

### Characters
```typescript
GET    /api/characters          // List user's characters
POST   /api/characters          // Generate new character
GET    /api/characters/:id      // Get character details
PUT    /api/characters/:id      // Update character
DELETE /api/characters/:id      // Delete character
POST   /api/characters/:id/image // Generate character image
POST   /api/characters/:id/train // Train personality kernel
```

### World Modules
```typescript
GET    /api/worlds              // List user's worlds
GET    /api/worlds/public       // List public worlds
POST   /api/worlds              // Create world module
GET    /api/worlds/:id          // Get world details
PUT    /api/worlds/:id          // Update world
DELETE /api/worlds/:id          // Delete world
POST   /api/worlds/:id/clone    // Clone world
POST   /api/worlds/:id/expand   // Expand world
```

### Game Sessions (Architect only)
```typescript
GET    /api/game/sessions       // List sessions
POST   /api/game/sessions       // Create session
GET    /api/game/sessions/:id   // Get session
PUT    /api/game/sessions/:id   // Update session
DELETE /api/game/sessions/:id   // Delete session
```

## 🔌 WebSocket Events

### Client → Server
```typescript
join_session(sessionId)
player_input({ sessionId, input, character })
meta_command({ sessionId, command })
architect_command({ sessionId, command, parameters })
audit_response({ sessionId, auditId, approved, reasoning })
```

### Server → Client
```typescript
session_joined({ sessionId, session })
narrative_update({ playerId, input, response, effects })
meta_command_result({ playerId, command, result })
audit_request({ sessionId, playerId, command })
audit_resolved({ auditId, approved, reasoning })
world_modified({ architect, modifications })
npc_spawned({ npc, spawnLocation })
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:watch
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:watch
```

### Integration Tests
```bash
npm run test:integration
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/whiteroom_db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=whiteroom_db
DATABASE_USER=postgres
DATABASE_PASSWORD=password

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1
OPENAI_IMAGE_MODEL=gpt-image-1

# Server
NODE_ENV=development
PORT=3001
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

## 🌟 Key Features

### AI-Driven Character Generation
- Personality kernels based on Big 5 psychological model
- Domain specialization weights
- Meta-skill development
- Narrative coherence tracking

### Recursive World Building
- Infinite nesting of reality layers
- Genre blending and transition
- Physics rule inheritance and modification
- Entropy-based stability system

### Meta-Narrative Gameplay
- Fourth wall breaking as core mechanic
- System audit negotiations
- Timeline manipulation
- Direct AI interaction

### Real-Time Collaboration
- WebSocket-based live sessions
- Multi-player narrative construction
- Architect tools for session management
- AI-mediated conflict resolution

## 🎨 UI/UX Design

### Visual Theme
- **Matrix aesthetic** with green terminal text
- **Void black** backgrounds with subtle gradients
- **Neon accent colors** for different game elements
- **Monospace fonts** for authentic terminal feel

### Color Coding
- **Green (#00ff00)** - Matrix text, system responses
- **Blue (#0080ff)** - Reality/physics effects
- **Purple (#8040ff)** - Meta-commands and fourth wall
- **Red (#ff0040)** - High entropy/dangerous events
- **Gold (#ffd700)** - Architect privileges

## 📈 Roadmap

### Phase 1: Core System ✅
- [x] Backend API and database
- [x] AI integration layer
- [x] Basic frontend components
- [x] Character generation
- [x] World module creation

### Phase 2: Advanced Features 🚧
- [ ] Mobile companion app
- [ ] Advanced meta-command system
- [ ] Community world sharing
- [ ] Session recording/playback

### Phase 3: Expansion 📋
- [ ] VR integration
- [ ] AI voice synthesis
- [ ] Community marketplace
- [ ] Streaming integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4.1 and image generation APIs
- The cyberpunk and meta-fiction communities for inspiration
- Early testers and AI enthusiasts

## 📞 Support

- Documentation: [docs.whiteroom.exe](https://docs.whiteroom.exe)
- Discord: [WhiteRoom Community](https://discord.gg/whiteroom)
- Issues: [GitHub Issues](https://github.com/your-org/whiteroom-exe/issues)

---

*"In WhiteRoom, narrative obeys entropy. You may build any world. But if you lie, the system will remember."*