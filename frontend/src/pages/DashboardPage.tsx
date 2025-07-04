import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Users, 
  Globe, 
  Gamepad2, 
  Plus, 
  Terminal,
  Zap,
  Crown,
  TrendingUp,
  Clock
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { charactersApi, worldsApi, gameApi } from '../services/api'
import { Character, WorldModule, GameSession } from '../types'

export function DashboardPage() {
  const { user } = useAuthStore()
  const [characters, setCharacters] = useState<Character[]>([])
  const [worlds, setWorlds] = useState<WorldModule[]>([])
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [charactersData, worldsData, sessionsData] = await Promise.all([
          charactersApi.getAll(),
          worldsApi.getAll(),
          gameApi.getSessions()
        ])
        
        setCharacters(charactersData)
        setWorlds(worldsData)
        setSessions(sessionsData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-matrix w-16 h-16">
          <Terminal className="w-16 h-16 matrix-text animate-pulse" />
        </div>
      </div>
    )
  }

  const activeCharacters = characters.filter(c => 
    c.stats.narrative_coherence > 70
  )

  const recentSessions = sessions
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="narrative-panel">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, <span className="matrix-text">{user?.username}</span>
              </h1>
              <p className="text-gray-400">
                {user?.role === 'architect' ? (
                  <>You have the power to shape reality itself. What world will you create today?</>
                ) : (
                  <>Ready to dive deeper into the recursive matrix? Your characters await.</>
                )}
              </p>
            </div>
            {user?.role === 'architect' && (
              <Crown className="w-12 h-12 architect-text" />
            )}
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
        <div className="void-panel p-6 rounded-lg border-l-4 border-matrix-green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Characters</p>
              <p className="text-2xl font-bold matrix-text">{activeCharacters.length}</p>
            </div>
            <Users className="w-8 h-8 matrix-text" />
          </div>
        </div>

        <div className="void-panel p-6 rounded-lg border-l-4 border-reality-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">World Modules</p>
              <p className="text-2xl font-bold reality-text">{worlds.length}</p>
            </div>
            <Globe className="w-8 h-8 reality-text" />
          </div>
        </div>

        <div className="void-panel p-6 rounded-lg border-l-4 border-meta-purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Game Sessions</p>
              <p className="text-2xl font-bold meta-text">{sessions.length}</p>
            </div>
            <Gamepad2 className="w-8 h-8 meta-text" />
          </div>
        </div>

        <div className="void-panel p-6 rounded-lg border-l-4 border-entropy-red">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Recursion Depth</p>
              <p className="text-2xl font-bold entropy-text">
                {Math.max(...characters.map(c => c.stats.recursion_depth), 0)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 entropy-text" />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/characters/create"
            className="reality-button p-4 rounded-lg flex items-center space-x-3 hover-glow transition-all"
          >
            <Plus className="w-6 h-6" />
            <span>Generate Character</span>
          </Link>

          <Link
            to="/worlds/create"
            className="meta-button p-4 rounded-lg flex items-center space-x-3 hover-glow transition-all"
          >
            <Plus className="w-6 h-6" />
            <span>Create World</span>
          </Link>

          {user?.role === 'architect' && (
            <Link
              to="/architect"
              className="architect-button p-4 rounded-lg flex items-center space-x-3 hover-glow transition-all"
            >
              <Crown className="w-6 h-6" />
              <span>Architect Console</span>
            </Link>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Characters */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Characters</h2>
            <Link to="/characters" className="text-matrix-green hover:underline text-sm">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {characters.slice(0, 3).map((character) => (
              <div key={character.id} className="character-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{character.name}</h3>
                    <p className="text-sm text-gray-400 truncate">
                      {character.backstory.substring(0, 60)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      <span className="matrix-text">
                        Coherence: {character.stats.narrative_coherence}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Depth: {character.stats.recursion_depth}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {characters.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No characters yet</p>
                <p className="text-sm">Create your first AI personality kernel</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Sessions</h2>
            {user?.role === 'architect' && (
              <Link to="/architect" className="text-architect-gold hover:underline text-sm">
                Create session
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {recentSessions.map((session) => (
              <Link
                key={session.id}
                to={`/session/${session.id}`}
                className="block void-panel p-4 rounded-lg hover:border-matrix-green transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {session.current_world.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {session.players.length} players • {session.current_world.genre}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(session.updated_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs entropy-text">
                      Entropy: {session.current_world.entropy_level}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {sessions.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active sessions</p>
                <p className="text-sm">
                  {user?.role === 'architect' 
                    ? 'Create a new session to start playing'
                    : 'Wait for an Architect to invite you'
                  }
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center text-gray-500 text-sm"
      >
        <p>
          <Zap className="w-4 h-4 inline mr-1" />
          Tip: Higher narrative coherence grants more powerful meta-commands
        </p>
      </motion.div>
    </div>
  )
}