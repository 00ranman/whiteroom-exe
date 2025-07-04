import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Crown, 
  Plus, 
  Users, 
  Globe, 
  Zap, 
  Settings,
  Play,
  Pause,
  RotateCcw,
  Terminal,
  Brain,
  Layers
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { gameApi, worldsApi } from '../services/api'
import { GameSession, WorldModule } from '../types'

export function ArchitectDashboard() {
  const { user } = useAuthStore()
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [worlds, setWorlds] = useState<WorldModule[]>([])
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateSession, setShowCreateSession] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [sessionsData, worldsData] = await Promise.all([
        gameApi.getSessions(),
        worldsApi.getAll()
      ])
      setSessions(sessionsData.filter(s => s.architect_id === user?.id))
      setWorlds(worldsData)
    } catch (error) {
      toast.error('Failed to load architect data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = async () => {
    try {
      const session = await gameApi.createSession({ players: [] })
      setSessions(prev => [session, ...prev])
      setShowCreateSession(false)
      toast.success('New session created')
    } catch (error) {
      toast.error('Failed to create session')
    }
  }

  const getSessionStatus = (session: GameSession) => {
    const lastUpdate = new Date(session.updated_at)
    const now = new Date()
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceUpdate < 1) return { status: 'active', color: 'text-matrix-green' }
    if (hoursSinceUpdate < 24) return { status: 'idle', color: 'text-meta-purple' }
    return { status: 'dormant', color: 'text-gray-400' }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-matrix w-16 h-16">
          <Crown className="w-16 h-16 architect-text animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="narrative-panel">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Crown className="w-8 h-8 architect-text mr-4" />
              <div>
                <h1 className="text-3xl font-bold architect-text">Architect Console</h1>
                <p className="text-gray-400">
                  Command the recursive reality matrix. Shape worlds, manage sessions, and orchestrate narratives.
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">System Access Level</div>
              <div className="text-xl font-bold architect-text">UNLIMITED</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <div className="void-panel p-6 rounded-lg border-l-4 border-architect-gold">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Sessions</p>
              <p className="text-2xl font-bold architect-text">
                {sessions.filter(s => getSessionStatus(s).status === 'active').length}
              </p>
            </div>
            <Play className="w-8 h-8 architect-text" />
          </div>
        </div>

        <div className="void-panel p-6 rounded-lg border-l-4 border-reality-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Players</p>
              <p className="text-2xl font-bold reality-text">
                {sessions.reduce((total, session) => total + session.players.length, 0)}
              </p>
            </div>
            <Users className="w-8 h-8 reality-text" />
          </div>
        </div>

        <div className="void-panel p-6 rounded-lg border-l-4 border-matrix-green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">World Modules</p>
              <p className="text-2xl font-bold matrix-text">{worlds.length}</p>
            </div>
            <Globe className="w-8 h-8 matrix-text" />
          </div>
        </div>

        <div className="void-panel p-6 rounded-lg border-l-4 border-entropy-red">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Entropy</p>
              <p className="text-2xl font-bold entropy-text">
                {sessions.length > 0 ? Math.round(
                  sessions.reduce((sum, s) => sum + s.current_world.entropy_level, 0) / sessions.length
                ) : 0}
              </p>
            </div>
            <Zap className="w-8 h-8 entropy-text" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Sessions */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Session Management</h2>
              <button
                onClick={() => setShowCreateSession(true)}
                className="architect-button px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Session</span>
              </button>
            </div>

            <div className="space-y-4">
              {sessions.length === 0 ? (
                <div className="text-center py-12 void-panel rounded-lg">
                  <Crown className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No Active Sessions</h3>
                  <p className="text-gray-500 mb-4">Create your first session to begin orchestrating reality</p>
                  <button
                    onClick={handleCreateSession}
                    className="architect-button px-6 py-3 rounded-lg"
                  >
                    Initialize Session
                  </button>
                </div>
              ) : (
                sessions.map((session) => {
                  const status = getSessionStatus(session)
                  return (
                    <motion.div
                      key={session.id}
                      whileHover={{ scale: 1.01 }}
                      className="void-panel p-4 rounded-lg cursor-pointer border-l-4 border-architect-gold hover:border-matrix-green transition-all"
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="font-semibold">{session.current_world.name}</h3>
                            <span className={`ml-2 text-xs px-2 py-1 rounded ${status.color} bg-opacity-20`}>
                              {status.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{session.current_world.genre}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs">
                            <span>
                              <Users className="w-3 h-3 inline mr-1" />
                              {session.players.length} players
                            </span>
                            <span>
                              <Zap className="w-3 h-3 inline mr-1" />
                              Entropy: {session.current_world.entropy_level}
                            </span>
                            <span>
                              <Layers className="w-3 h-3 inline mr-1" />
                              Depth: {session.narrative_state.recursion_stack.length}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            Last active: {new Date(session.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>
        </div>

        {/* Architect Tools */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Architect Tools</h3>
              <div className="space-y-3">
                <button className="w-full architect-button p-3 rounded-lg flex items-center space-x-3">
                  <Brain className="w-5 h-5" />
                  <span>Generate NPC</span>
                </button>
                <button className="w-full reality-button p-3 rounded-lg flex items-center space-x-3">
                  <Globe className="w-5 h-5" />
                  <span>Spawn World Module</span>
                </button>
                <button className="w-full meta-button p-3 rounded-lg flex items-center space-x-3">
                  <RotateCcw className="w-5 h-5" />
                  <span>Temporal Manipulation</span>
                </button>
                <button className="w-full entropy-button p-3 rounded-lg flex items-center space-x-3">
                  <Zap className="w-5 h-5" />
                  <span>Reality Stabilizer</span>
                </button>
              </div>
            </div>

            {/* System Monitor */}
            <div className="void-panel p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center">
                <Terminal className="w-4 h-4 mr-2" />
                System Monitor
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Matrix Stability</span>
                  <span className="matrix-text">98.7%</span>
                </div>
                <div className="flex justify-between">
                  <span>Narrative Coherence</span>
                  <span className="reality-text">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>Recursion Overflow</span>
                  <span className="meta-text">0.3%</span>
                </div>
                <div className="flex justify-between">
                  <span>Entropy Cascade</span>
                  <span className="entropy-text">LOW</span>
                </div>
              </div>
            </div>

            {/* Recent Worlds */}
            <div>
              <h3 className="font-semibold mb-3">Recent Worlds</h3>
              <div className="space-y-2">
                {worlds.slice(0, 3).map((world) => (
                  <div key={world.id} className="void-panel p-3 rounded">
                    <div className="font-medium text-sm">{world.name}</div>
                    <div className="text-xs text-gray-400">{world.genre}</div>
                    <div className="text-xs mt-1">
                      <span className="entropy-text">Entropy: {world.entropy_level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateSession && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreateSession(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="narrative-panel max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold architect-text mb-4">Initialize New Session</h2>
            <p className="text-gray-400 mb-6">
              Create a new game session. You can add players and configure the world after creation.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleCreateSession}
                className="architect-button px-6 py-3 rounded-lg flex-1"
              >
                Create Session
              </button>
              <button
                onClick={() => setShowCreateSession(false)}
                className="entropy-button px-6 py-3 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedSession(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="narrative-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold architect-text">{selectedSession.current_world.name}</h2>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Session Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Session Details</h3>
                  <div className="space-y-1 text-sm">
                    <div>ID: <span className="matrix-text font-mono">{selectedSession.id}</span></div>
                    <div>Players: <span className="reality-text">{selectedSession.players.length}</span></div>
                    <div>Created: {new Date(selectedSession.created_at).toLocaleDateString()}</div>
                    <div>Status: <span className={getSessionStatus(selectedSession).color}>
                      {getSessionStatus(selectedSession).status}
                    </span></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">World State</h3>
                  <div className="space-y-1 text-sm">
                    <div>Genre: {selectedSession.current_world.genre}</div>
                    <div>Entropy: <span className="entropy-text">{selectedSession.current_world.entropy_level}</span></div>
                    <div>Timelines: <span className="reality-text">{selectedSession.narrative_state.active_timelines.length}</span></div>
                    <div>Recursion: <span className="meta-text">{selectedSession.narrative_state.recursion_stack.length}</span></div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button className="architect-button px-4 py-2 rounded flex-1">
                  Enter Session
                </button>
                <button className="reality-button px-4 py-2 rounded">
                  Modify World
                </button>
                <button className="entropy-button px-4 py-2 rounded">
                  Archive
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}