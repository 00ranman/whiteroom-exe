import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Zap, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  FileText,
  Sliders,
  Sparkles
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { charactersApi } from '../services/api'

interface CharacterForm {
  backstory: string
  personalityTraits: string
  domainWeights: Record<string, number>
}

const personalityDomains = [
  { key: 'combat', label: 'Combat & Tactics', description: 'Warfare, strategy, physical confrontation' },
  { key: 'social', label: 'Social & Manipulation', description: 'Persuasion, deception, networking' },
  { key: 'knowledge', label: 'Knowledge & Research', description: 'Investigation, academia, lore' },
  { key: 'technology', label: 'Technology & Hacking', description: 'Digital systems, programming, cybernetics' },
  { key: 'mysticism', label: 'Mysticism & Occult', description: 'Magic, spiritual practices, unknown forces' },
  { key: 'survival', label: 'Survival & Adaptation', description: 'Resourcefulness, endurance, improvisation' },
  { key: 'meta', label: 'Meta & Fourth Wall', description: 'Narrative awareness, system manipulation' }
]

export function CharacterCreationPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCharacter, setGeneratedCharacter] = useState<any>(null)

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CharacterForm>({
    defaultValues: {
      domainWeights: personalityDomains.reduce((acc, domain) => ({
        ...acc,
        [domain.key]: 0.5
      }), {})
    }
  })

  const watchedWeights = watch('domainWeights')

  const onSubmit = async (data: CharacterForm) => {
    try {
      setIsGenerating(true)
      const character = await charactersApi.create(data)
      setGeneratedCharacter(character)
      setStep(3)
      toast.success('Character generated successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate character')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFinish = () => {
    navigate('/characters')
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
            <Brain className="w-16 h-16 matrix-text animate-pulse" />
          </div>
          <p className="matrix-text text-lg">Generating personality kernel...</p>
          <p className="text-sm text-gray-400 mt-2">Training neural pathways...</p>
          <div className="mt-4 w-64 bg-gray-800 rounded-full h-2">
            <motion.div
              className="bg-matrix-green h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'easeInOut' }}
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
            <span className="matrix-text">Neural Profile Generator</span>
          </h1>
          <p className="text-gray-400">
            Create an AI personality kernel for the White Room matrix
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= stepNum 
                    ? 'bg-matrix-green text-black' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-0.5 ${
                    step > stepNum ? 'bg-matrix-green' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Backstory */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="narrative-panel"
            >
              <div className="flex items-center mb-6">
                <FileText className="w-6 h-6 matrix-text mr-3" />
                <h2 className="text-xl font-semibold">Character Backstory</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Backstory & Origin
                  </label>
                  <textarea
                    {...register('backstory', { 
                      required: 'Backstory is required',
                      minLength: { value: 50, message: 'Backstory must be at least 50 characters' }
                    })}
                    rows={6}
                    className="matrix-input w-full p-4 bg-transparent border rounded-lg resize-none"
                    placeholder="Describe your character's origin, background, motivations, and defining experiences. The more detailed and coherent your backstory, the more powerful your character's AI personality kernel will become..."
                  />
                  {errors.backstory && (
                    <p className="mt-1 text-sm entropy-text">{errors.backstory.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Personality Traits
                  </label>
                  <textarea
                    {...register('personalityTraits', { 
                      required: 'Personality traits are required',
                      minLength: { value: 20, message: 'Personality description must be at least 20 characters' }
                    })}
                    rows={4}
                    className="matrix-input w-full p-4 bg-transparent border rounded-lg resize-none"
                    placeholder="Describe your character's personality, behavioral patterns, quirks, fears, and desires. How do they react under pressure? What drives them?"
                  />
                  {errors.personalityTraits && (
                    <p className="mt-1 text-sm entropy-text">{errors.personalityTraits.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="reality-button px-6 py-3 rounded-lg flex items-center space-x-2"
                >
                  <span>Configure Neural Weights</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Domain Weights */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="narrative-panel"
            >
              <div className="flex items-center mb-6">
                <Sliders className="w-6 h-6 matrix-text mr-3" />
                <h2 className="text-xl font-semibold">Domain Specialization</h2>
              </div>

              <p className="text-gray-400 mb-6">
                Adjust your character's aptitude in different domains. Higher weights grant 
                more power in specific narrative areas and influence meta-command effectiveness.
              </p>

              <div className="space-y-6">
                {personalityDomains.map((domain) => (
                  <div key={domain.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{domain.label}</h3>
                        <p className="text-sm text-gray-400">{domain.description}</p>
                      </div>
                      <span className="matrix-text font-mono">
                        {Math.round(watchedWeights[domain.key] * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={watchedWeights[domain.key]}
                      onChange={(e) => setValue(`domainWeights.${domain.key}`, parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="meta-button px-6 py-3 rounded-lg flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Backstory</span>
                </button>
                <button
                  type="submit"
                  className="reality-button px-6 py-3 rounded-lg flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Character</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Generated Character */}
          {step === 3 && generatedCharacter && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="narrative-panel"
            >
              <div className="text-center mb-6">
                <Brain className="w-12 h-12 matrix-text mx-auto mb-3" />
                <h2 className="text-2xl font-semibold matrix-text">
                  Neural Profile Generated
                </h2>
                <p className="text-gray-400">Your AI personality kernel is ready</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Character Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Identity
                    </h3>
                    <p className="text-lg matrix-text font-semibold">{generatedCharacter.name}</p>
                    <p className="text-sm text-gray-400 mt-2">{generatedCharacter.backstory}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Meta-Skills Acquired</h3>
                    <div className="space-y-2">
                      {generatedCharacter.meta_skills.map((skill: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{skill.name}</span>
                          <span className="meta-text text-sm">Level {skill.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Neural Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Narrative Coherence</span>
                        <span className="matrix-text">{generatedCharacter.stats.narrative_coherence}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Reality Anchor</span>
                        <span className="reality-text">{generatedCharacter.stats.reality_anchor}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Fourth Wall Permeability</span>
                        <span className="meta-text">{generatedCharacter.stats.fourth_wall_permeability}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Recursion Depth</span>
                        <span className="entropy-text">{generatedCharacter.stats.recursion_depth}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Big 5 Personality Profile</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Openness</span>
                        <span>{generatedCharacter.personality_kernel.openness}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conscientiousness</span>
                        <span>{generatedCharacter.personality_kernel.conscientiousness}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Extraversion</span>
                        <span>{generatedCharacter.personality_kernel.extraversion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Agreeableness</span>
                        <span>{generatedCharacter.personality_kernel.agreeableness}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Neuroticism</span>
                        <span>{generatedCharacter.personality_kernel.neuroticism}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="matrix-input border-2 border-matrix-green px-8 py-3 rounded-lg font-semibold hover-glow"
                >
                  Enter the White Room
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </div>

      <style jsx>{`
        .range-slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #00ff00;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
        }
        
        .range-slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #00ff00;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
        }
      `}</style>
    </div>
  )
}