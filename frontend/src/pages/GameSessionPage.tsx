import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Terminal, 
  Send, 
  User, 
  Zap, 
  Settings,
  Eye,
  AlertTriangle,
  Layers,
  TrendingUp
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'
import { socketService } from '../services/socket'
import { gameApi, charactersApi } from '../services/api'
import { Character } from '../types'

interface MetaCommandForm {
  command: string
  parameters: Record<string, any>
  justification: string
}

export function GameSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { user, token } = useAuthStore()
  const { 
    currentSession, 
    currentCharacter,
    narrativeEvents,
    systemAudits,
    isConnected,
    joinSession,
    sendPlayerInput,
    sendMetaCommand,
    setCurrentCharacter
  } = useGameStore()

  const [userCharacters, setUserCharacters] = useState<Character[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [showMetaConsole, setShowMetaConsole] = useState(false)
  const [metaCommand, setMetaCommand] = useState<MetaCommandForm>({
    command: '',
    parameters: {},
    justification: ''
  })

  useEffect(() => {
    if (!sessionId || !token) return

    // Connect to socket if not already connected
    if (!socketService.connected) {
      socketService.connect(token)
    }

    // Join the session
    joinSession(sessionId)

    // Load user's characters
    loadUserCharacters()

    return () => {
      // Don't disconnect socket here as it might be used elsewhere
    }
  }, [sessionId, token, joinSession])

  const loadUserCharacters = async () => {
    try {
      const characters = await charactersApi.getAll()
      setUserCharacters(characters)
      
      // Auto-select first character if none selected
      if (!currentCharacter && characters.length > 0) {
        setCurrentCharacter(characters[0])
      }
    } catch (error) {
      toast.error('Failed to load characters')
    }
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !currentCharacter) return

    sendPlayerInput(inputMessage)
    setInputMessage('')
  }

  const handleMetaCommand = () => {
    if (!metaCommand.command || !metaCommand.justification) {
      toast.error('Please provide both command and justification')
      return
    }

    const command = {
      command: metaCommand.command,
      parameters: metaCommand.parameters,
      requires_audit: true,
      system_access_level: getSystemAccessLevel(metaCommand.command),
      justification: metaCommand.justification
    }

    sendMetaCommand(command)
    setShowMetaConsole(false)
    setMetaCommand({ command: '', parameters: {}, justification: '' })
    toast.success('Meta-command submitted for audit')
  }

  const getSystemAccessLevel = (command: string): number => {
    const levels: Record<string, number> = {
      'fork_timeline': 5,
      'modify_world': 7,
      'rewrite_past': 8,
      'spawn_world': 6,
      'break_fourth_wall': 9
    }
    return levels[command] || 3
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'action': return 'text-white-room'
      case 'dialogue': return 'text-matrix-green'
      case 'system': return 'text-reality-blue'
      case 'meta': return 'text-meta-purple'
      default: return 'text-gray-400'
    }
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-matrix w-16 h-16">
          <Terminal className="w-16 h-16 matrix-text animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Game Area */}
      <div className="lg:col-span-3 space-y-6">
        {/* Session Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="narrative-panel"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold reality-text">
                {currentSession.current_world.name}
              </h1>
              <p className="text-gray-400">{currentSession.current_world.genre}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <span className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-matrix-green' : 'bg-entropy-red'}`} />
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                <span>Entropy: <span className="entropy-text">{currentSession.current_world.entropy_level}</span></span>
                <span>Recursion: <span className="meta-text">{currentSession.narrative_state.recursion_stack.length}</span></span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Current Scene</div>
              <div className="font-semibold">{currentSession.narrative_state.current_scene}</div>
            </div>
          </div>
        </motion.div>

        {/* Narrative Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="narrative-panel h-96"
        >
          <h2 className="text-lg font-semibold mb-4">Narrative Stream</h2>
          <div className="h-80 overflow-y-auto narrative-scroll space-y-3">
            {narrativeEvents.length === 0 ? (
              <div className="text-center text-gray-500 mt-16">
                <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Narrative stream empty</p>
                <p className="text-sm">Be the first to shape reality</p>
              </div>
            ) : (
              narrativeEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-900 bg-opacity-30 p-3 rounded border-l-2 border-gray-600"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${getEventTypeColor(event.type)}`}>
                      [{event.type.toUpperCase()}] {event.actor_name || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{event.content}</p>
                  {event.reality_impact > 0.5 && (
                    <div className="mt-2 text-xs entropy-text">
                      High reality impact: {Math.round(event.reality_impact * 100)}%
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="narrative-panel"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Reality Interface</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowMetaConsole(!showMetaConsole)}
                className="meta-button px-3 py-1 rounded text-sm"
              >
                <Zap className="w-4 h-4 mr-1 inline" />
                Meta-Console
              </button>
            </div>
          </div>

          {/* Character Selection */}
          {userCharacters.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Active Character</label>
              <select
                value={currentCharacter?.id || ''}
                onChange={(e) => {
                  const character = userCharacters.find(c => c.id === e.target.value)
                  if (character) setCurrentCharacter(character)
                }}
                className="matrix-input bg-gray-900 border rounded px-3 py-2 w-full md:w-auto"
              >
                {userCharacters.map((character) => (
                  <option key={character.id} value={character.id}>
                    {character.name} (Coherence: {character.stats.narrative_coherence}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Standard Input */}
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="matrix-input flex-1 bg-transparent border-b border-matrix-green focus:outline-none"
              placeholder="Describe your action, speak dialogue, or manipulate reality..."
              disabled={!currentCharacter}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !currentCharacter}
              className="reality-button px-4 py-2 rounded flex items-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Transmit</span>
            </button>
          </div>

          {!currentCharacter && (
            <p className="text-entropy-red text-sm mt-2">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              Select a character to interact with the narrative
            </p>
          )}
        </motion.div>

        {/* Meta-Console */}
        {showMetaConsole && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="narrative-panel border-meta-purple"
          >
            <h3 className="text-lg font-semibold meta-text mb-4">Meta-Command Console</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Command</label>
                <select
                  value={metaCommand.command}
                  onChange={(e) => setMetaCommand(prev => ({ ...prev, command: e.target.value }))}
                  className="matrix-input bg-gray-900 border rounded px-3 py-2 w-full"
                >
                  <option value="">Select meta-command</option>
                  <option value="fork_timeline">Fork Timeline</option>
                  <option value="modify_world">Modify World Rules</option>
                  <option value="rewrite_past">Rewrite Past Event</option>
                  <option value="spawn_world">Spawn Nested World</option>
                  <option value="break_fourth_wall">Break Fourth Wall</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Justification</label>
                <textarea
                  value={metaCommand.justification}
                  onChange={(e) => setMetaCommand(prev => ({ ...prev, justification: e.target.value }))}
                  rows={3}
                  className="matrix-input w-full bg-transparent border rounded px-3 py-2 resize-none"
                  placeholder="Explain why this meta-command serves the narrative and maintains coherence..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleMetaCommand}
                  disabled={!metaCommand.command || !metaCommand.justification}
                  className="meta-button px-4 py-2 rounded disabled:opacity-50"
                >
                  Submit for Audit
                </button>
                <button
                  onClick={() => setShowMetaConsole(false)}
                  className="entropy-button px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* World Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="void-panel p-4 rounded-lg"
        >
          <h3 className="font-semibold mb-3 flex items-center">
            <Layers className="w-4 h-4 mr-2" />
            World Status
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Entropy Level</span>
              <span className="entropy-text">{currentSession.current_world.entropy_level}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Timelines</span>
              <span className="reality-text">{currentSession.narrative_state.active_timelines.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Recursion Depth</span>
              <span className="meta-text">{currentSession.narrative_state.recursion_stack.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Connected Players</span>
              <span className="matrix-text">{currentSession.players.length}</span>
            </div>
          </div>
        </motion.div>

        {/* Active Character */}
        {currentCharacter && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="void-panel p-4 rounded-lg"
          >
            <h3 className="font-semibold mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Active Character
            </h3>
            <div className="space-y-3">
              <div>
                <div className="font-medium">{currentCharacter.name}</div>
                <div className="text-xs text-gray-400">Neural Profile Active</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-gray-400">Coherence</div>
                  <div className="matrix-text">{currentCharacter.stats.narrative_coherence}%</div>
                </div>
                <div>
                  <div className="text-gray-400">Meta Access</div>
                  <div className="meta-text">{currentCharacter.stats.fourth_wall_permeability}%</div>
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Meta-Skills</div>
                <div className="flex flex-wrap gap-1">
                  {currentCharacter.meta_skills.map((skill, index) => (
                    <span key={index} className="text-xs bg-meta-purple bg-opacity-20 text-meta-purple px-1 py-0.5 rounded">
                      {skill.name} L{skill.level}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* System Audits */}
        {systemAudits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="void-panel p-4 rounded-lg"
          >
            <h3 className="font-semibold mb-3 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              System Audits
            </h3>
            <div className="space-y-2">
              {systemAudits.slice(-3).map((audit) => (
                <div key={audit.id} className="text-xs bg-gray-900 bg-opacity-50 p-2 rounded">
                  <div className="flex justify-between mb-1">
                    <span className="meta-text">{audit.command.command}</span>
                    <span className={`${
                      audit.resolution === 'approved' ? 'text-matrix-green' :
                      audit.resolution === 'denied' ? 'text-entropy-red' :
                      audit.resolution === 'modified' ? 'text-meta-purple' :
                      'text-gray-400'
                    }`}>
                      {audit.resolution || 'Pending'}
                    </span>
                  </div>
                  <p className="text-gray-400">{audit.player_justification.substring(0, 60)}...</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Help */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="void-panel p-4 rounded-lg"
        >
          <h3 className="font-semibold mb-3 flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            Interface Guide
          </h3>
          <div className="space-y-2 text-xs text-gray-400">
            <p><span className="matrix-text">Green text:</span> Dialogue & system responses</p>
            <p><span className="reality-text">Blue text:</span> World & physics effects</p>
            <p><span className="meta-text">Purple text:</span> Meta-commands & fourth wall</p>
            <p><span className="entropy-text">Red text:</span> High impact events</p>
            <div className="mt-3 pt-2 border-t border-gray-700">
              <p className="text-gray-500">Higher narrative coherence grants access to more powerful meta-commands.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}