import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Plus, 
  User, 
  Brain, 
  Zap, 
  Image as ImageIcon,
  Trash2,
  Edit,
  TrendingUp
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { charactersApi } from '../services/api'
import { Character } from '../types'

export function CharacterListPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingImage, setGeneratingImage] = useState<string | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

  useEffect(() => {
    loadCharacters()
  }, [])

  const loadCharacters = async () => {
    try {
      const data = await charactersApi.getAll()
      setCharacters(data)
    } catch (error) {
      toast.error('Failed to load characters')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateImage = async (character: Character) => {
    try {
      setGeneratingImage(character.id)
      const { imageUrl } = await charactersApi.generateImage(character.id)
      toast.success('Character image generated!')
      // In a real app, you'd save this URL to the character
      console.log('Generated image URL:', imageUrl)
    } catch (error) {
      toast.error('Failed to generate image')
    } finally {
      setGeneratingImage(null)
    }
  }

  const handleDeleteCharacter = async (character: Character) => {
    if (!confirm(`Are you sure you want to delete ${character.name}? This action cannot be undone.`)) {
      return
    }

    try {
      await charactersApi.delete(character.id)
      setCharacters(prev => prev.filter(c => c.id !== character.id))
      toast.success('Character deleted')
    } catch (error) {
      toast.error('Failed to delete character')
    }
  }

  const getCoherenceColor = (coherence: number) => {
    if (coherence >= 80) return 'text-matrix-green'
    if (coherence >= 60) return 'text-reality-blue'
    if (coherence >= 40) return 'text-meta-purple'
    return 'text-entropy-red'
  }

  const getMetaSkillIcon = (type: string) => {
    switch (type) {
      case 'loopback': return '🔄'
      case 'fork_thread': return '🌿'
      case 'editor_access': return '✏️'
      case 'system_audit': return '🔍'
      default: return '⚡'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-matrix w-16 h-16">
          <Brain className="w-16 h-16 matrix-text animate-pulse" />
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
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="matrix-text">Neural Profiles</span>
          </h1>
          <p className="text-gray-400">
            Manage your AI personality kernels for the White Room matrix
          </p>
        </div>
        <Link
          to="/characters/create"
          className="reality-button px-6 py-3 rounded-lg flex items-center space-x-2 hover-glow"
        >
          <Plus className="w-5 h-5" />
          <span>Generate New Character</span>
        </Link>
      </motion.div>

      {/* Character Grid */}
      {characters.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h2 className="text-xl font-semibold mb-2 text-gray-400">No Characters Yet</h2>
          <p className="text-gray-500 mb-6">
            Create your first AI personality kernel to begin your journey
          </p>
          <Link
            to="/characters/create"
            className="matrix-input border-2 border-matrix-green px-6 py-3 rounded-lg font-semibold hover-glow inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Generate Character</span>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character, index) => (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="character-card group"
              onClick={() => setSelectedCharacter(character)}
            >
              {/* Character Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{character.name}</h3>
                  <p className="text-sm text-gray-400">
                    Created {new Date(character.created_at).toLocaleDateString()}
                  </p>
                </div>
                <User className="w-8 h-8 text-matrix-green" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center">
                  <div className={`text-lg font-bold ${getCoherenceColor(character.stats.narrative_coherence)}`}>
                    {character.stats.narrative_coherence}%
                  </div>
                  <div className="text-xs text-gray-400">Coherence</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold reality-text">
                    {character.stats.reality_anchor}%
                  </div>
                  <div className="text-xs text-gray-400">Anchor</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold meta-text">
                    {character.stats.fourth_wall_permeability}%
                  </div>
                  <div className="text-xs text-gray-400">Meta Access</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold entropy-text">
                    {character.stats.recursion_depth}
                  </div>
                  <div className="text-xs text-gray-400">Depth</div>
                </div>
              </div>

              {/* Meta Skills */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-300">Meta-Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {character.meta_skills.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="text-xs bg-meta-purple bg-opacity-20 text-meta-purple px-2 py-1 rounded"
                      title={skill.description}
                    >
                      {getMetaSkillIcon(skill.type)} {skill.name} (L{skill.level})
                    </span>
                  ))}
                </div>
              </div>

              {/* Backstory Preview */}
              <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                {character.backstory}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleGenerateImage(character)
                    }}
                    disabled={generatingImage === character.id}
                    className="p-2 rounded bg-reality-blue bg-opacity-20 hover:bg-opacity-40 transition-all"
                    title="Generate Image"
                  >
                    {generatingImage === character.id ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-reality-blue border-t-transparent" />
                    ) : (
                      <ImageIcon className="w-4 h-4 reality-text" />
                    )}
                  </button>
                  <button
                    className="p-2 rounded bg-matrix-green bg-opacity-20 hover:bg-opacity-40 transition-all"
                    title="Edit Character"
                  >
                    <Edit className="w-4 h-4 matrix-text" />
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteCharacter(character)
                  }}
                  className="p-2 rounded bg-entropy-red bg-opacity-20 hover:bg-opacity-40 transition-all"
                  title="Delete Character"
                >
                  <Trash2 className="w-4 h-4 entropy-text" />
                </button>
              </div>

              {/* Recursion Indicator */}
              {character.stats.recursion_depth > 0 && (
                <div className="recursion-indicator" title={`Recursion Depth: ${character.stats.recursion_depth}`} />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Character Detail Modal */}
      {selectedCharacter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedCharacter(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="narrative-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold matrix-text">{selectedCharacter.name}</h2>
              <button
                onClick={() => setSelectedCharacter(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Full Backstory */}
              <div>
                <h3 className="font-semibold mb-2">Backstory</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{selectedCharacter.backstory}</p>
              </div>

              {/* Personality Kernel */}
              <div>
                <h3 className="font-semibold mb-2">Personality Kernel</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Big 5 Traits</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Openness</span>
                        <span className="matrix-text">{selectedCharacter.personality_kernel.openness}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conscientiousness</span>
                        <span className="matrix-text">{selectedCharacter.personality_kernel.conscientiousness}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Extraversion</span>
                        <span className="matrix-text">{selectedCharacter.personality_kernel.extraversion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Agreeableness</span>
                        <span className="matrix-text">{selectedCharacter.personality_kernel.agreeableness}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Neuroticism</span>
                        <span className="matrix-text">{selectedCharacter.personality_kernel.neuroticism}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Domain Weights</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(selectedCharacter.personality_kernel.domain_weights).map(([domain, weight]) => (
                        <div key={domain} className="flex justify-between">
                          <span className="capitalize">{domain}</span>
                          <span className="reality-text">{Math.round(weight * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta Skills Detail */}
              <div>
                <h3 className="font-semibold mb-2">Meta-Skills</h3>
                <div className="space-y-2">
                  {selectedCharacter.meta_skills.map((skill, index) => (
                    <div key={index} className="bg-gray-900 bg-opacity-50 p-3 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">
                          {getMetaSkillIcon(skill.type)} {skill.name}
                        </span>
                        <span className="meta-text">Level {skill.level}</span>
                      </div>
                      <p className="text-sm text-gray-400">{skill.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}