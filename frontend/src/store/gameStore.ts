import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { GameSession, Character, NarrativeEvent, SystemAudit } from '../types'
import { socketService } from '../services/socket'

interface GameState {
  currentSession: GameSession | null
  currentCharacter: Character | null
  narrativeEvents: NarrativeEvent[]
  systemAudits: SystemAudit[]
  connectedPlayers: string[]
  isConnected: boolean
  
  // Actions
  setCurrentSession: (session: GameSession) => void
  setCurrentCharacter: (character: Character) => void
  addNarrativeEvent: (event: NarrativeEvent) => void
  addSystemAudit: (audit: SystemAudit) => void
  updateAudit: (auditId: string, updates: Partial<SystemAudit>) => void
  setConnectedPlayers: (players: string[]) => void
  setConnectionStatus: (connected: boolean) => void
  clearSession: () => void
  
  // Socket actions
  joinSession: (sessionId: string) => void
  sendPlayerInput: (input: string) => void
  sendMetaCommand: (command: any) => void
  sendArchitectCommand: (command: string, parameters: any) => void
  resolveAudit: (auditId: string, approved: boolean, reasoning: string, modifications?: any) => void
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    currentSession: null,
    currentCharacter: null,
    narrativeEvents: [],
    systemAudits: [],
    connectedPlayers: [],
    isConnected: false,

    setCurrentSession: (session) => {
      set({ currentSession: session })
    },

    setCurrentCharacter: (character) => {
      set({ currentCharacter: character })
    },

    addNarrativeEvent: (event) => {
      set((state) => ({
        narrativeEvents: [...state.narrativeEvents, event]
      }))
    },

    addSystemAudit: (audit) => {
      set((state) => ({
        systemAudits: [...state.systemAudits, audit]
      }))
    },

    updateAudit: (auditId, updates) => {
      set((state) => ({
        systemAudits: state.systemAudits.map(audit =>
          audit.id === auditId ? { ...audit, ...updates } : audit
        )
      }))
    },

    setConnectedPlayers: (players) => {
      set({ connectedPlayers: players })
    },

    setConnectionStatus: (connected) => {
      set({ isConnected: connected })
    },

    clearSession: () => {
      set({
        currentSession: null,
        currentCharacter: null,
        narrativeEvents: [],
        systemAudits: [],
        connectedPlayers: [],
        isConnected: false
      })
    },

    joinSession: (sessionId) => {
      socketService.emit('join_session', sessionId)
    },

    sendPlayerInput: (input) => {
      const { currentSession, currentCharacter } = get()
      if (!currentSession || !currentCharacter) return

      socketService.emit('player_input', {
        sessionId: currentSession.id,
        input,
        character: currentCharacter
      })
    },

    sendMetaCommand: (command) => {
      const { currentSession } = get()
      if (!currentSession) return

      socketService.emit('meta_command', {
        sessionId: currentSession.id,
        command
      })
    },

    sendArchitectCommand: (command, parameters) => {
      const { currentSession } = get()
      if (!currentSession) return

      socketService.emit('architect_command', {
        sessionId: currentSession.id,
        command,
        parameters
      })
    },

    resolveAudit: (auditId, approved, reasoning, modifications) => {
      const { currentSession } = get()
      if (!currentSession) return

      socketService.emit('audit_response', {
        sessionId: currentSession.id,
        auditId,
        approved,
        reasoning,
        modifications
      })
    }
  }))
)

// Subscribe to socket events
socketService.on('session_joined', (data) => {
  useGameStore.getState().setCurrentSession(data.session)
  useGameStore.getState().setConnectionStatus(true)
})

socketService.on('narrative_update', (data) => {
  const event: NarrativeEvent = {
    id: `event_${Date.now()}`,
    type: 'action',
    actor_id: data.playerId,
    content: `${data.input}\n\n${data.response}`,
    timestamp: data.timestamp,
    reality_impact: 0.1
  }
  useGameStore.getState().addNarrativeEvent(event)
})

socketService.on('meta_command_result', (data) => {
  const event: NarrativeEvent = {
    id: `meta_${Date.now()}`,
    type: 'meta',
    actor_id: data.playerId,
    content: `Meta Command: ${data.command.command}\nResult: ${data.result.message}`,
    timestamp: data.timestamp,
    reality_impact: 0.5
  }
  useGameStore.getState().addNarrativeEvent(event)
})

socketService.on('audit_request', (data) => {
  const audit: SystemAudit = {
    id: `audit_${Date.now()}`,
    session_id: data.sessionId,
    initiator_id: data.playerId,
    command: data.command,
    player_justification: data.command.justification || '',
    created_at: new Date().toISOString()
  }
  useGameStore.getState().addSystemAudit(audit)
})

socketService.on('audit_resolved', (data) => {
  useGameStore.getState().updateAudit(data.auditId, {
    resolution: data.approved ? 'approved' : 'denied',
    ai_justification: data.reasoning,
    modifications: data.modifications,
    resolved_at: data.timestamp
  })
})

socketService.on('player_joined', (data) => {
  // Handle player joining
})

socketService.on('world_modified', (data) => {
  const event: NarrativeEvent = {
    id: `world_${Date.now()}`,
    type: 'system',
    actor_id: data.architect,
    content: `World Modified: ${JSON.stringify(data.modifications)}`,
    timestamp: data.timestamp,
    reality_impact: 0.8
  }
  useGameStore.getState().addNarrativeEvent(event)
})

socketService.on('npc_spawned', (data) => {
  const event: NarrativeEvent = {
    id: `npc_${Date.now()}`,
    type: 'system',
    actor_id: 'system',
    content: `NPC Spawned: ${data.npc.name} at ${data.spawnLocation}`,
    timestamp: data.timestamp,
    reality_impact: 0.3
  }
  useGameStore.getState().addNarrativeEvent(event)
})

socketService.on('error', (data) => {
  console.error('Socket error:', data.message)
})

socketService.on('disconnect', () => {
  useGameStore.getState().setConnectionStatus(false)
})