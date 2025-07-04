import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Terminal, Lock, User, Mail, Crown, Users } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

interface RegisterForm {
  username: string
  email: string
  password: string
  confirmPassword: string
  role: 'player' | 'architect'
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser, isLoading } = useAuthStore()
  const [showMatrix, setShowMatrix] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>({
    defaultValues: { role: 'player' }
  })

  const password = watch('password')
  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setShowMatrix(true)
      await registerUser(data.username, data.email, data.password, data.role)
      toast.success('Neural profile created. Welcome to the White Room.')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed')
      setShowMatrix(false)
    }
  }

  if (showMatrix) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="loading-matrix w-16 h-16 mx-auto mb-4">
            <Terminal className="w-16 h-16 matrix-text animate-pulse" />
          </div>
          <p className="matrix-text">Generating neural pathways...</p>
          <p className="text-sm text-gray-400 mt-2">Creating consciousness matrix...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="void-panel p-8 rounded-lg">
          <div className="text-center mb-8">
            <Terminal className="w-12 h-12 matrix-text mx-auto mb-4" />
            <h1 className="text-2xl font-bold matrix-text">Neural Registration</h1>
            <p className="text-gray-400 mt-2">
              Initialize your presence in the White Room
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Choose Your Interface Level
              </label>
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedRole === 'player'
                      ? 'border-reality-blue bg-reality-blue bg-opacity-20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => register('role').onChange({ target: { value: 'player' } })}
                >
                  <input
                    {...register('role')}
                    type="radio"
                    value="player"
                    className="sr-only"
                  />
                  <Users className="w-6 h-6 reality-text mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-center">Player</h3>
                  <p className="text-xs text-gray-400 text-center mt-1">
                    Navigate the matrix
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedRole === 'architect'
                      ? 'border-architect-gold bg-architect-gold bg-opacity-20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => register('role').onChange({ target: { value: 'architect' } })}
                >
                  <input
                    {...register('role')}
                    type="radio"
                    value="architect"
                    className="sr-only"
                  />
                  <Crown className="w-6 h-6 architect-text mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-center architect-text">Architect</h3>
                  <p className="text-xs text-gray-400 text-center mt-1">
                    Shape reality itself
                  </p>
                </motion.div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-matrix-green" />
                <input
                  {...register('username', { 
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Username must be at least 3 characters' }
                  })}
                  type="text"
                  className="matrix-input w-full pl-10 pr-4 py-3 bg-transparent border rounded-lg focus:ring-2 focus:ring-matrix-green focus:border-transparent"
                  placeholder="Your identity in the matrix"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm entropy-text">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-matrix-green" />
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="matrix-input w-full pl-10 pr-4 py-3 bg-transparent border rounded-lg focus:ring-2 focus:ring-matrix-green focus:border-transparent"
                  placeholder="Neural uplink address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm entropy-text">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-matrix-green" />
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type="password"
                  className="matrix-input w-full pl-10 pr-4 py-3 bg-transparent border rounded-lg focus:ring-2 focus:ring-matrix-green focus:border-transparent"
                  placeholder="Encryption key"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm entropy-text">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-matrix-green" />
                <input
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  type="password"
                  className="matrix-input w-full pl-10 pr-4 py-3 bg-transparent border rounded-lg focus:ring-2 focus:ring-matrix-green focus:border-transparent"
                  placeholder="Verify encryption key"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm entropy-text">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold hover-glow disabled:opacity-50 transition-all ${
                selectedRole === 'architect' 
                  ? 'architect-button' 
                  : 'reality-button'
              }`}
            >
              {isLoading ? 'Initializing...' : 'Create Neural Profile'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have a profile?{' '}
              <Link to="/login" className="matrix-text hover:underline">
                Access existing session
              </Link>
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
            >
              ← Return to surface reality
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}