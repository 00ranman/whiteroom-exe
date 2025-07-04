# WhiteRoom.exe WebSocket Documentation

## Connection

Connect to the WebSocket server with authentication:

```javascript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3001', {
  auth: {
    token: 'your_jwt_token_here'
  }
})
```

## Authentication

All WebSocket connections require a valid JWT token passed in the auth object during connection. Invalid tokens will result in connection rejection.

## Client Events (Outgoing)

### join_session
Join a game session to begin receiving real-time updates.

```javascript
socket.emit('join_session', sessionId)
```

**Parameters:**
- `sessionId` (string): UUID of the session to join

**Requirements:**
- User must be the architect or a player in the session

### player_input
Send player narrative input to the session.

```javascript
socket.emit('player_input', {
  sessionId: 'uuid',
  input: 'I examine the mysterious door carefully...',
  character: characterObject
})
```

**Parameters:**
- `sessionId` (string): Session UUID
- `input` (string): Player's narrative input
- `character` (object): Complete character object

**Requirements:**
- Must be joined to the session
- Character must belong to the user

### meta_command
Execute a meta-command that may require system audit.

```javascript
socket.emit('meta_command', {
  sessionId: 'uuid',
  command: {
    command: 'fork_timeline',
    parameters: {
      branch_point: 'current',
      probability: 0.7
    },
    requires_audit: true,
    system_access_level: 5,
    justification: 'Creating alternate timeline to explore different outcome'
  }
})
```

**Parameters:**
- `sessionId` (string): Session UUID
- `command` (object): Meta-command specification
  - `command` (string): Command name
  - `parameters` (object): Command parameters
  - `requires_audit` (boolean): Whether audit is needed
  - `system_access_level` (number): Required access level
  - `justification` (string): Player justification

**Meta-Commands:**
- `fork_timeline` - Create alternate narrative branch
- `modify_world` - Change world physics rules
- `rewrite_past` - Modify previous narrative events
- `spawn_world` - Create nested world layer
- `break_fourth_wall` - Direct system interaction

### architect_command
Execute architect-specific commands (architects only).

```javascript
socket.emit('architect_command', {
  sessionId: 'uuid',
  command: 'spawn_npc',
  parameters: {
    backstory: 'A mysterious figure in robes...',
    personality: 'Enigmatic and helpful',
    location: 'current scene'
  }
})
```

**Parameters:**
- `sessionId` (string): Session UUID
- `command` (string): Architect command
- `parameters` (object): Command parameters

**Architect Commands:**
- `modify_world` - Direct world manipulation
- `spawn_npc` - Create AI-generated NPCs
- `temporal_shift` - Major timeline changes
- `entropy_control` - Stability adjustments

### audit_response
Respond to a system audit request (architects only).

```javascript
socket.emit('audit_response', {
  sessionId: 'uuid',
  auditId: 'uuid',
  approved: true,
  reasoning: 'Timeline fork is narratively justified and enhances story',
  modifications: {
    probability: 0.5  // Modified from original 0.7
  }
})
```

**Parameters:**
- `sessionId` (string): Session UUID
- `auditId` (string): Audit request UUID
- `approved` (boolean): Approval decision
- `reasoning` (string): AI/Architect reasoning
- `modifications` (object): Modified parameters if partially approved

## Server Events (Incoming)

### session_joined
Confirmation that user has joined the session.

```javascript
socket.on('session_joined', (data) => {
  console.log('Joined session:', data.sessionId)
  console.log('Session data:', data.session)
})
```

**Data:**
```json
{
  "sessionId": "uuid",
  "session": {
    "id": "uuid",
    "architect_id": "uuid",
    "players": ["uuid"],
    "current_world": {},
    "narrative_state": {}
  }
}
```

### player_joined
Notification when another player joins the session.

```javascript
socket.on('player_joined', (data) => {
  console.log('Player joined:', data.userId)
})
```

**Data:**
```json
{
  "userId": "uuid"
}
```

### narrative_update
Real-time narrative event from player input.

```javascript
socket.on('narrative_update', (data) => {
  console.log('New narrative event:', data)
})
```

**Data:**
```json
{
  "playerId": "uuid",
  "input": "I examine the door",
  "response": "The door reveals ancient symbols that pulse with energy...",
  "effects": [
    {
      "type": "world_change",
      "target": "door_state",
      "changes": {
        "examined": true,
        "symbols_visible": true
      }
    }
  ],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### meta_command_result
Result of meta-command execution.

```javascript
socket.on('meta_command_result', (data) => {
  console.log('Meta-command result:', data)
})
```

**Data:**
```json
{
  "playerId": "uuid",
  "command": {
    "command": "fork_timeline",
    "parameters": {}
  },
  "result": {
    "success": true,
    "message": "Timeline forked successfully",
    "auditRequired": false
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### audit_request
System audit request for meta-command (sent to architect).

```javascript
socket.on('audit_request', (data) => {
  console.log('Audit requested:', data)
})
```

**Data:**
```json
{
  "sessionId": "uuid",
  "playerId": "uuid",
  "command": {
    "command": "rewrite_past",
    "parameters": {
      "event_id": "uuid",
      "new_content": "Different outcome"
    },
    "justification": "This change improves narrative coherence"
  }
}
```

### audit_resolved
Notification when system audit is resolved.

```javascript
socket.on('audit_resolved', (data) => {
  console.log('Audit resolved:', data)
})
```

**Data:**
```json
{
  "auditId": "uuid",
  "approved": true,
  "reasoning": "Change approved with modifications for balance",
  "modifications": {
    "reality_impact": 0.3
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### world_modified
Notification when world state is modified by architect.

```javascript
socket.on('world_modified', (data) => {
  console.log('World modified:', data)
})
```

**Data:**
```json
{
  "architect": "uuid",
  "modifications": {
    "physics_rules": {
      "gravity": "Objects fall upward during full moons"
    }
  },
  "result": {
    "success": true,
    "message": "Gravity rules modified"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### npc_spawned
Notification when AI NPC is created.

```javascript
socket.on('npc_spawned', (data) => {
  console.log('NPC spawned:', data)
})
```

**Data:**
```json
{
  "npc": {
    "id": "uuid",
    "name": "The Mysterious Stranger",
    "personality_kernel": {},
    "backstory": "...",
    "stats": {}
  },
  "spawnLocation": "current scene",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### error
Error notifications for failed operations.

```javascript
socket.on('error', (data) => {
  console.error('WebSocket error:', data.message)
})
```

**Data:**
```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### disconnect
Connection lost notification.

```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason)
})
```

## Connection Management

### Automatic Reconnection
The client should implement automatic reconnection with exponential backoff:

```javascript
socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Server initiated disconnect, do not reconnect automatically
    return
  }
  
  // Reconnect automatically for other reasons
  setTimeout(() => {
    socket.connect()
  }, 1000)
})
```

### Authentication Errors
Handle authentication failures:

```javascript
socket.on('connect_error', (error) => {
  if (error.message === 'Authentication error') {
    // Token is invalid, redirect to login
    redirectToLogin()
  }
})
```

## Best Practices

### 1. Connection State Management
Track connection state in your application:

```javascript
const [isConnected, setIsConnected] = useState(false)

socket.on('connect', () => setIsConnected(true))
socket.on('disconnect', () => setIsConnected(false))
```

### 2. Event Cleanup
Remove event listeners when components unmount:

```javascript
useEffect(() => {
  const handleNarrativeUpdate = (data) => {
    // Handle update
  }
  
  socket.on('narrative_update', handleNarrativeUpdate)
  
  return () => {
    socket.off('narrative_update', handleNarrativeUpdate)
  }
}, [])
```

### 3. Error Handling
Always handle potential errors:

```javascript
socket.emit('player_input', data, (response) => {
  if (response.error) {
    console.error('Failed to send input:', response.error)
    showErrorToUser(response.error)
  }
})
```

### 4. Rate Limiting
Implement client-side rate limiting for user actions:

```javascript
const [lastCommandTime, setLastCommandTime] = useState(0)

const sendCommand = (command) => {
  const now = Date.now()
  if (now - lastCommandTime < 1000) {  // 1 second cooldown
    showMessage('Please wait before sending another command')
    return
  }
  
  setLastCommandTime(now)
  socket.emit('meta_command', command)
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_FAILED` | Authentication token invalid |
| `SESSION_NOT_FOUND` | Session does not exist |
| `NOT_AUTHORIZED` | User not authorized for session |
| `COMMAND_FAILED` | Meta-command execution failed |
| `AUDIT_REQUIRED` | Command requires system audit |
| `RATE_LIMITED` | Too many commands too quickly |
| `INVALID_INPUT` | Malformed command or data |
| `CHARACTER_REQUIRED` | No character selected for action |
| `ARCHITECT_ONLY` | Command requires architect privileges |

## Examples

### Complete Session Flow

```javascript
// Connect and authenticate
const socket = io('ws://localhost:3001', {
  auth: { token: userToken }
})

// Join session
socket.emit('join_session', sessionId)

// Listen for session confirmation
socket.on('session_joined', ({ session }) => {
  console.log('Joined session:', session.current_world.name)
})

// Send player input
socket.emit('player_input', {
  sessionId,
  input: 'I cast a spell to illuminate the dark corridor',
  character: selectedCharacter
})

// Listen for narrative updates
socket.on('narrative_update', (update) => {
  addToNarrativeLog(update.response)
})

// Execute meta-command
socket.emit('meta_command', {
  sessionId,
  command: {
    command: 'break_fourth_wall',
    parameters: { wall_type: 'narrative' },
    requires_audit: true,
    system_access_level: 9,
    justification: 'Character becomes aware they are in a simulation'
  }
})

// Handle audit request (if architect)
socket.on('audit_request', (audit) => {
  // Show audit UI and respond
  socket.emit('audit_response', {
    sessionId: audit.sessionId,
    auditId: audit.id,
    approved: true,
    reasoning: 'Meta-awareness adds depth to narrative'
  })
})
```