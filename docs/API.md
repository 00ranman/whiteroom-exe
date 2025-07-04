# WhiteRoom.exe API Documentation

## Authentication

All API endpoints (except auth routes) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Auth Endpoints

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string", 
  "password": "string",
  "role": "player" | "architect"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "player" | "architect",
    "created_at": "timestamp"
  }
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "username": "string", 
    "email": "string",
    "role": "player" | "architect"
  }
}
```

#### Verify Token
```http
GET /api/auth/verify
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string", 
    "role": "player" | "architect"
  }
}
```

## Characters

### List Characters
```http
GET /api/characters
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "string",
    "personality_kernel": {
      "openness": 0-100,
      "conscientiousness": 0-100,
      "extraversion": 0-100,
      "agreeableness": 0-100,
      "neuroticism": 0-100,
      "domain_weights": {
        "combat": 0.0-1.0,
        "social": 0.0-1.0,
        "technology": 0.0-1.0,
        "meta": 0.0-1.0
      },
      "training_context": "string"
    },
    "backstory": "string",
    "stats": {
      "narrative_coherence": 0-100,
      "reality_anchor": 0-100, 
      "recursion_depth": 0-10,
      "fourth_wall_permeability": 0-100
    },
    "meta_skills": [
      {
        "name": "string",
        "type": "loopback" | "fork_thread" | "editor_access" | "system_audit",
        "level": 1-10,
        "description": "string"
      }
    ],
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### Create Character
```http
POST /api/characters
```

**Request Body:**
```json
{
  "backstory": "string",
  "personalityTraits": "string",
  "domainWeights": {
    "combat": 0.0-1.0,
    "social": 0.0-1.0,
    "technology": 0.0-1.0,
    "meta": 0.0-1.0
  }
}
```

**Response:** Character object (see above structure)

### Get Character
```http
GET /api/characters/:id
```

**Response:** Character object

### Update Character
```http
PUT /api/characters/:id
```

**Request Body:**
```json
{
  "name": "string",
  "backstory": "string", 
  "stats": {
    "narrative_coherence": 0-100,
    "reality_anchor": 0-100,
    "recursion_depth": 0-10,
    "fourth_wall_permeability": 0-100
  },
  "meta_skills": [...]
}
```

**Response:** Updated character object

### Delete Character
```http
DELETE /api/characters/:id
```

**Response:**
```json
{
  "message": "Character deleted successfully"
}
```

### Generate Character Image
```http
POST /api/characters/:id/image
```

**Response:**
```json
{
  "imageUrl": "string"
}
```

### Train Character
```http
POST /api/characters/:id/train
```

**Request Body:**
```json
{
  "trainingData": "string",
  "focusAreas": ["string"]
}
```

**Response:**
```json
{
  "message": "Character personality updated",
  "updatedKernel": {
    "domain_weights": {},
    "training_context": "string"
  }
}
```

## World Modules

### List User Worlds
```http
GET /api/worlds
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "genre": "string",
    "parent_world_id": "uuid | null",
    "nested_worlds": ["uuid"],
    "physics_rules": {
      "gravity": "string",
      "magic": "string", 
      "technology": "string",
      "meta_physics": "string"
    },
    "narrative_constraints": ["string"],
    "entropy_level": 0-10,
    "created_by": "uuid",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### List Public Worlds
```http
GET /api/worlds/public
```

**Response:** Array of world objects (limited fields)

### Create World
```http
POST /api/worlds
```

**Request Body:**
```json
{
  "genre": "string",
  "parentWorldId": "uuid",
  "constraints": ["string"]
}
```

**Response:** World object

### Get World
```http
GET /api/worlds/:id
```

**Response:** World object

### Update World
```http
PUT /api/worlds/:id
```

**Request Body:**
```json
{
  "name": "string",
  "physics_rules": {},
  "narrative_constraints": ["string"],
  "entropy_level": 0-10
}
```

**Response:** Updated world object

### Delete World
```http
DELETE /api/worlds/:id
```

**Response:**
```json
{
  "message": "World module deleted successfully"
}
```

### Get Nested Worlds
```http
GET /api/worlds/:id/nested
```

**Response:** Array of nested world objects

### Clone World
```http
POST /api/worlds/:id/clone
```

**Request Body:**
```json
{
  "newName": "string"
}
```

**Response:** Cloned world object

### Expand World
```http
POST /api/worlds/:id/expand
```

**Request Body:**
```json
{
  "direction": "string",
  "theme": "string"
}
```

**Response:** New expansion world object

## Game Sessions (Architect Only)

### List Sessions
```http
GET /api/game/sessions
```

**Response:**
```json
[
  {
    "id": "uuid",
    "architect_id": "uuid",
    "players": ["uuid"],
    "current_world": {},
    "narrative_state": {
      "current_scene": "string",
      "active_timelines": [],
      "character_states": {},
      "world_consistency": {},
      "recursion_stack": []
    },
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### Create Session
```http
POST /api/game/sessions
```

**Request Body:**
```json
{
  "players": ["uuid"]
}
```

**Response:** Session object

### Get Session
```http
GET /api/game/sessions/:id
```

**Response:** Session object

### Update Session
```http
PUT /api/game/sessions/:id
```

**Request Body:**
```json
{
  "current_world": {},
  "narrative_state": {}
}
```

**Response:** Updated session object

### Delete Session
```http
DELETE /api/game/sessions/:id
```

**Response:**
```json
{
  "message": "Session deleted successfully"
}
```

### Get Session Events
```http
GET /api/game/sessions/:id/events?limit=50&offset=0
```

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "action" | "dialogue" | "system" | "meta",
    "actor_id": "uuid",
    "actor_name": "string",
    "content": "string",
    "reality_impact": 0.0-1.0,
    "created_at": "timestamp"
  }
]
```

### Add Event
```http
POST /api/game/sessions/:id/events
```

**Request Body:**
```json
{
  "type": "action" | "dialogue" | "system" | "meta",
  "content": "string",
  "reality_impact": 0.0-1.0
}
```

**Response:** Event object

### Get System Audits
```http
GET /api/game/sessions/:id/audits
```

**Response:**
```json
[
  {
    "id": "uuid",
    "session_id": "uuid",
    "initiator_id": "uuid",
    "initiator_name": "string",
    "command": {
      "command": "string",
      "parameters": {},
      "requires_audit": true,
      "system_access_level": 1-10
    },
    "ai_justification": "string",
    "player_justification": "string",
    "resolution": "approved" | "denied" | "modified",
    "modifications": {},
    "created_at": "timestamp",
    "resolved_at": "timestamp"
  }
]
```

### Create Audit
```http
POST /api/game/sessions/:id/audits
```

**Request Body:**
```json
{
  "command": {
    "command": "string",
    "parameters": {},
    "requires_audit": true,
    "system_access_level": 1-10
  },
  "player_justification": "string"
}
```

**Response:** Audit object

### Resolve Audit
```http
PUT /api/game/sessions/:sessionId/audits/:auditId
```

**Request Body:**
```json
{
  "resolution": "approved" | "denied" | "modified",
  "ai_justification": "string",
  "modifications": {}
}
```

**Response:** Updated audit object

### Get Session Stats
```http
GET /api/game/sessions/:id/stats
```

**Response:**
```json
{
  "session_id": "uuid",
  "duration": 123456,
  "event_statistics": [
    {
      "type": "string",
      "count": 42,
      "avg_impact": 0.5
    }
  ],
  "audit_statistics": [
    {
      "resolution": "string", 
      "count": 10
    }
  ],
  "narrative_state": {
    "active_timelines": 3,
    "recursion_depth": 2,
    "entropy_level": 5
  },
  "player_count": 4
}
```

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Error message describing what went wrong"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided" | "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "Not authorized" | "Architect access required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Username or email already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

API requests are rate limited to:
- **100 requests per 15 minutes** per IP address
- Exceeded limits return HTTP 429 with message: "Too many requests from this IP, please try again later."

## WebSocket Events

See [WebSocket Documentation](WEBSOCKETS.md) for real-time event specifications.