import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { 
  Globe, 
  Layers, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight,
  Settings,
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { worldsApi } from '../services/api'

interface WorldForm {
  genre: string
  parentWorldId?: string
  constraints: string[]
  customConstraints: string
}

const predefinedGenres = [
  { id: 'cyberpunk', name: 'Cyberpunk', description: 'High tech, low life. Neon cities and digital consciousness.' },
  { id: 'fantasy', name: 'High Fantasy', description: 'Magic realms with dragons, wizards, and ancient powers.' },
  { id: 'horror', name: 'Cosmic Horror', description: 'Unknowable entities and reality-bending terror.' },
  { id: 'western', name: 'Weird West', description: 'Frontier justice meets supernatural mystery.' },
  { id: 'pirate', name: 'Pirate Adventure', description: 'High seas adventure with mythical creatures.' },
  { id: 'cartoon', name: 'Surreal Cartoon', description: 'Logic-defying animated reality where anything goes.' },
  { id: 'steampunk', name: 'Steampunk', description: 'Victorian technology powered by steam and brass.' },
  { id: 'space-opera', name: 'Space Opera', description: 'Epic galactic conflicts and alien civilizations.' },
  { id: 'meta-reality', name: 'Meta-Reality', description: 'Self-aware narrative spaces that know they\'re games.' },
  { id: 'custom', name: 'Custom Genre', description: 'Define your own unique genre blend.' }
]

const commonConstraints = [
  'No permanent character death',
  'Magic follows scientific principles',
  'Technology has mysterious origins',
  'Time travel creates paradoxes',
  'Reality can be questioned',
  'Fourth wall is permeable',
  'Narrative must remain coherent',
  'Characters retain memories across timelines'
]

export function WorldCreationPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedWorld, setGeneratedWorld] = useState<any>(null)

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<WorldForm>({
    defaultValues: {
      constraints: [],
      customConstraints: ''
    }
  })

  const selectedGenre = watch('genre')
  const selectedConstraints = watch('constraints')

  const onSubmit = async (data: WorldForm) => {
    try {
      setIsGenerating(true)
      
      const allConstraints = [
        ...data.constraints,
        ...(data.customConstraints ? data.customConstraints.split('\n').filter(c => c.trim()) : [])
      ]

      const world = await worldsApi.create({
        genre: data.genre === 'custom' ? 'Custom Genre Blend' : data.genre,
        parentWorldId: data.parentWorldId,
        constraints: allConstraints
      })
      
      setGeneratedWorld(world)
      setStep(3)
      toast.success('World module generated successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate world')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFinish = () => {
    navigate('/worlds')
  }

  const toggleConstraint = (constraint: string) => {
    const current = selectedConstraints || []
    const updated = current.includes(constraint)
      ? current.filter(c => c !== constraint)
      : [...current, constraint]
    setValue('constraints', updated)
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="loading-matrix w-16 h-16 mx-auto mb-4">
            <Globe className="w-16 h-16 matrix-text animate-pulse" />
          </div>
          <p className="matrix-text text-lg">Generating world module...</p>
          <p className="text-sm text-gray-400 mt-2">Assembling reality framework...</p>
          <div className="mt-4 w-64 bg-gray-800 rounded-full h-2">
            <motion.div
              className="bg-reality-blue h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 4, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            <span className="reality-text">World Module Generator</span>
          </h1>
          <p className="text-gray-400">
            Create recursive reality frameworks for the White Room matrix
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= stepNum 
                    ? 'bg-reality-blue text-black' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-0.5 ${
                    step > stepNum ? 'bg-reality-blue' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Genre Selection */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="narrative-panel"
            >
              <div className="flex items-center mb-6">
                <Globe className="w-6 h-6 reality-text mr-3" />
                <h2 className="text-xl font-semibold">Reality Framework</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Choose Genre Foundation
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {predefinedGenres.map((genre) => (
                      <motion.div
                        key={genre.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedGenre === genre.id
                            ? 'border-reality-blue bg-reality-blue bg-opacity-20'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => setValue('genre', genre.id)}
                      >
                        <input
                          {...register('genre', { required: 'Genre is required' })}
                          type="radio"
                          value={genre.id}
                          className="sr-only"
                        />
                        <h3 className="font-semibold mb-1">{genre.name}</h3>
                        <p className="text-sm text-gray-400">{genre.description}</p>
                      </motion.div>
                    ))}
                  </div>
                  {errors.genre && (
                    <p className="mt-2 text-sm entropy-text">{errors.genre.message}</p>
                  )}
                </div>

                {selectedGenre === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <label className="block text-sm font-medium text-gray-300">
                      Describe Your Custom Genre
                    </label>
                    <textarea
                      className="matrix-input w-full p-4 bg-transparent border rounded-lg resize-none"
                      rows={4}
                      placeholder="Describe the unique blend of genres, themes, and elements that define your world. Be specific about tone, technology level, magic systems, and cultural elements..."
                    />
                  </motion.div>
                )}
              </div>

              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!selectedGenre}
                  className="reality-button px-6 py-3 rounded-lg flex items-center space-x-2 disabled:opacity-50"
                >
                  <span>Configure Rules</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Constraints and Rules */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="narrative-panel"
            >
              <div className="flex items-center mb-6">
                <Settings className="w-6 h-6 reality-text mr-3" />
                <h2 className="text-xl font-semibold">Narrative Constraints</h2>
              </div>

              <p className="text-gray-400 mb-6">
                Set the rules that govern your world. These constraints help maintain 
                narrative coherence and define the boundaries of what's possible.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Predefined Constraints
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {commonConstraints.map((constraint) => (
                      <motion.div
                        key={constraint}
                        whileHover={{ scale: 1.02 }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedConstraints?.includes(constraint)
                            ? 'border-matrix-green bg-matrix-green bg-opacity-20'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => toggleConstraint(constraint)}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded border ${
                            selectedConstraints?.includes(constraint)
                              ? 'bg-matrix-green border-matrix-green'
                              : 'border-gray-500'
                          }`}>
                            {selectedConstraints?.includes(constraint) && (
                              <span className="text-black text-xs">✓</span>
                            )}
                          </div>
                          <span className="text-sm">{constraint}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom Constraints
                  </label>
                  <textarea
                    {...register('customConstraints')}
                    rows={4}
                    className="matrix-input w-full p-4 bg-transparent border rounded-lg resize-none"
                    placeholder="Add your own custom rules and constraints, one per line. For example:&#10;- Magic requires emotional sacrifice&#10;- Technology fails during full moons&#10;- Characters can communicate with their past selves"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    One constraint per line. These will be combined with your selected predefined constraints.
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="meta-button px-6 py-3 rounded-lg flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Genre</span>
                </button>
                <button
                  type="submit"
                  className="reality-button px-6 py-3 rounded-lg flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate World</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Generated World */}
          {step === 3 && generatedWorld && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="narrative-panel"
            >
              <div className="text-center mb-6">
                <Globe className="w-12 h-12 reality-text mx-auto mb-3" />
                <h2 className="text-2xl font-semibold reality-text">
                  World Module Generated
                </h2>
                <p className="text-gray-400">Your reality framework is ready for deployment</p>
              </div>

              <div className="space-y-6">
                {/* World Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Layers className="w-4 h-4 mr-2" />
                      World Identity
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-400">Name:</span>
                        <p className="reality-text font-semibold">{generatedWorld.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">Genre:</span>
                        <p className="text-sm">{generatedWorld.genre}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">Entropy Level:</span>
                        <p className="entropy-text">{generatedWorld.entropy_level}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Narrative Constraints</h3>
                    <div className="space-y-1 max-h-32 overflow-y-auto narrative-scroll">
                      {generatedWorld.narrative_constraints.map((constraint: string, index: number) => (
                        <div key={index} className="text-sm text-gray-300 flex items-start">
                          <span className="matrix-text mr-2">•</span>
                          <span>{constraint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Physics Rules */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Physics & Meta-Physics Rules
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(generatedWorld.physics_rules).map(([rule, description]) => (
                      <div key={rule} className="bg-gray-900 bg-opacity-50 p-3 rounded">
                        <h4 className="font-medium capitalize text-reality-blue mb-1">
                          {rule.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-gray-400">{description as string}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deployment Status */}
                <div className="bg-matrix-green bg-opacity-10 border border-matrix-green rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="w-2 h-2 bg-matrix-green rounded-full mr-2"></span>
                    <span className="font-semibold matrix-text">World Module Ready</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    This world module can now be used in game sessions or serve as a parent 
                    for nested reality frameworks. Architects can spawn this world during gameplay 
                    to create recursive narrative layers.
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="matrix-input border-2 border-reality-blue px-8 py-3 rounded-lg font-semibold hover-glow"
                >
                  Deploy to World Library
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  )
}