import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Globe, 
  Layers, 
  Copy,
  Trash2,
  Edit,
  Zap,
  TrendingUp,
  Eye
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { worldsApi } from '../services/api'
import { WorldModule } from '../types'

export function WorldListPage() {
  const [worlds, setWorlds] = useState<WorldModule[]>([])
  const [publicWorlds, setPublicWorlds] = useState<WorldModule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWorld, setSelectedWorld] = useState<WorldModule | null>(null)
  const [activeTab, setActiveTab] = useState<'my-worlds' | 'public'>('my-worlds')

  useEffect(() => {
    loadWorlds()
  }, [])

  const loadWorlds = async () => {
    try {
      const [myWorldsData, publicWorldsData] = await Promise.all([
        worldsApi.getAll(),
        worldsApi.getPublic()
      ])
      setWorlds(myWorldsData)
      setPublicWorlds(publicWorldsData)
    } catch (error) {
      toast.error('Failed to load worlds')
    } finally {
      setLoading(false)
    }
  }

  const handleCloneWorld = async (world: WorldModule) => {
    try {
      const clonedWorld = await worldsApi.clone(world.id, `${world.name} (Clone)`)
      setWorlds(prev => [clonedWorld, ...prev])
      toast.success(`Cloned "${world.name}" successfully`)
    } catch (error) {
      toast.error('Failed to clone world')
    }
  }

  const handleDeleteWorld = async (world: WorldModule) => {
    if (!confirm(`Are you sure you want to delete "${world.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await worldsApi.delete(world.id)
      setWorlds(prev => prev.filter(w => w.id !== world.id))
      toast.success('World deleted')
    } catch (error) {
      toast.error('Failed to delete world')
    }
  }

  const getEntropyColor = (level: number) => {
    if (level >= 8) return 'text-entropy-red'
    if (level >= 5) return 'text-meta-purple'
    if (level >= 3) return 'text-reality-blue'
    return 'text-matrix-green'
  }

  const getGenreIcon = (genre: string) => {
    const lower = genre.toLowerCase()
    if (lower.includes('cyber')) return '🌆'
    if (lower.includes('fantasy')) return '🗡️'
    if (lower.includes('horror')) return '👁️'
    if (lower.includes('west')) return '🤠'
    if (lower.includes('pirate')) return '🏴‍☠️'
    if (lower.includes('cartoon')) return '🎨'
    if (lower.includes('steam')) return '⚙️'
    if (lower.includes('space')) return '🚀'
    if (lower.includes('meta')) return '🔄'
    return '🌍'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-matrix w-16 h-16">
          <Globe className="w-16 h-16 reality-text animate-pulse" />
        </div>
      </div>
    )
  }

  const currentWorlds = activeTab === 'my-worlds' ? worlds : publicWorlds

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="reality-text">World Modules</span>
          </h1>
          <p className="text-gray-400">
            Manage reality frameworks for recursive narrative environments
          </p>
        </div>
        <Link
          to="/worlds/create"
          className="reality-button px-6 py-3 rounded-lg flex items-center space-x-2 hover-glow"
        >
          <Plus className="w-5 h-5" />
          <span>Create World Module</span>
        </Link>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('my-worlds')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'my-worlds'
              ? 'reality-button'
              : 'text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500'
          }`}
        >
          My Worlds ({worlds.length})
        </button>
        <button
          onClick={() => setActiveTab('public')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'public'
              ? 'reality-button'
              : 'text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500'
          }`}
        >
          Public Library ({publicWorlds.length})
        </button>
      </div>

      {/* World Grid */}
      {currentWorlds.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Globe className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h2 className="text-xl font-semibold mb-2 text-gray-400">
            {activeTab === 'my-worlds' ? 'No World Modules Yet' : 'No Public Worlds Available'}
          </h2>
          <p className="text-gray-500 mb-6">
            {activeTab === 'my-worlds' 
              ? 'Create your first reality framework to begin world building'
              : 'Check back later for community-created worlds'
            }
          </p>
          {activeTab === 'my-worlds' && (
            <Link
              to="/worlds/create"
              className="matrix-input border-2 border-reality-blue px-6 py-3 rounded-lg font-semibold hover-glow inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create World Module</span>
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentWorlds.map((world, index) => (
            <motion.div
              key={world.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="world-module group cursor-pointer"
              onClick={() => setSelectedWorld(world)}
            >
              {/* World Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">{getGenreIcon(world.genre)}</span>
                    <h3 className="text-lg font-semibold truncate">{world.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400">{world.genre}</p>
                  <p className="text-xs text-gray-500">
                    Created {new Date(world.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Globe className="w-6 h-6 reality-text flex-shrink-0" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className={`text-lg font-bold ${getEntropyColor(world.entropy_level)}`}>
                    {world.entropy_level}
                  </div>
                  <div className="text-xs text-gray-400">Entropy</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold matrix-text">
                    {world.nested_worlds.length}
                  </div>
                  <div className="text-xs text-gray-400">Nested</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold meta-text">
                    {world.narrative_constraints.length}
                  </div>
                  <div className="text-xs text-gray-400">Rules</div>
                </div>
              </div>

              {/* Physics Preview */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-300">Physics Rules</h4>
                <div className="space-y-1 max-h-16 overflow-hidden">
                  {Object.entries(world.physics_rules).slice(0, 2).map(([rule, description]) => (
                    <div key={rule} className="text-xs text-gray-400">
                      <span className="reality-text capitalize">{rule.replace('_', ' ')}:</span> {(description as string).substring(0, 40)}...
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCloneWorld(world)
                    }}
                    className="p-2 rounded bg-matrix-green bg-opacity-20 hover:bg-opacity-40 transition-all"
                    title="Clone World"
                  >
                    <Copy className="w-4 h-4 matrix-text" />
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded bg-reality-blue bg-opacity-20 hover:bg-opacity-40 transition-all"
                    title="Edit World"
                  >
                    <Edit className="w-4 h-4 reality-text" />
                  </button>
                </div>
                {activeTab === 'my-worlds' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteWorld(world)
                    }}
                    className="p-2 rounded bg-entropy-red bg-opacity-20 hover:bg-opacity-40 transition-all"
                    title="Delete World"
                  >
                    <Trash2 className="w-4 h-4 entropy-text" />
                  </button>
                )}
              </div>

              {/* Nested World Indicator */}
              {world.nested_worlds.length > 0 && (
                <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-meta-purple animate-pulse" title={`${world.nested_worlds.length} nested worlds`} />
              )}

              {/* High Entropy Warning */}
              {world.entropy_level >= 8 && (
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-entropy-red animate-pulse" title="High entropy - reality unstable" />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* World Detail Modal */}
      {selectedWorld && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedWorld(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="narrative-panel max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getGenreIcon(selectedWorld.genre)}</span>
                <div>
                  <h2 className="text-2xl font-bold reality-text">{selectedWorld.name}</h2>
                  <p className="text-gray-400">{selectedWorld.genre}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWorld(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Physics Rules */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Physics & Meta-Physics
                </h3>
                <div className="space-y-3">
                  {Object.entries(selectedWorld.physics_rules).map(([rule, description]) => (
                    <div key={rule} className="bg-gray-900 bg-opacity-50 p-3 rounded">
                      <h4 className="font-medium capitalize text-reality-blue mb-1">
                        {rule.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-gray-400">{description as string}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Narrative Constraints */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Layers className="w-4 h-4 mr-2" />
                  Narrative Constraints
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto narrative-scroll">
                  {selectedWorld.narrative_constraints.map((constraint, index) => (
                    <div key={index} className="flex items-start bg-gray-900 bg-opacity-30 p-2 rounded">
                      <span className="matrix-text mr-2 mt-0.5">•</span>
                      <span className="text-sm text-gray-300">{constraint}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* World Stats */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getEntropyColor(selectedWorld.entropy_level)}`}>
                  {selectedWorld.entropy_level}
                </div>
                <div className="text-sm text-gray-400">Entropy Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold matrix-text">
                  {selectedWorld.nested_worlds.length}
                </div>
                <div className="text-sm text-gray-400">Nested Worlds</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold meta-text">
                  {selectedWorld.narrative_constraints.length}
                </div>
                <div className="text-sm text-gray-400">Constraints</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold reality-text">
                  {Object.keys(selectedWorld.physics_rules).length}
                </div>
                <div className="text-sm text-gray-400">Physics Rules</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => handleCloneWorld(selectedWorld)}
                className="matrix-input border-2 border-matrix-green px-6 py-2 rounded-lg hover-glow flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Clone World</span>
              </button>
              {activeTab === 'public' && (
                <button className="reality-button px-6 py-2 rounded-lg flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Use in Session</span>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}