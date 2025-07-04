import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Terminal, Lock, User } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

interface LoginForm {
  username: string
  password: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [showMatrix, setShowMatrix] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      setShowMatrix(true)
      await login(data.username, data.password)
      toast.success('Welcome back to the White Room')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed')
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
          <p className="matrix-text">Initializing neural interface...</p>
          <p className="text-sm text-gray-400 mt-2">Authenticating consciousness...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="void-panel p-8 rounded-lg">
          <div className="text-center mb-8">
            <Terminal className="w-12 h-12 matrix-text mx-auto mb-4" />
            <h1 className="text-2xl font-bold matrix-text">Access Terminal</h1>
            <p className="text-gray-400 mt-2">
              Resume your session in the White Room
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-matrix-green" />
                <input
                  {...register('username', { required: 'Username is required' })}
                  type="text"
                  className="matrix-input w-full pl-10 pr-4 py-3 bg-transparent border rounded-lg focus:ring-2 focus:ring-matrix-green focus:border-transparent"
                  placeholder="Enter your identity"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm entropy-text">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-matrix-green" />
                <input
                  {...register('password', { required: 'Password is required' })}
                  type="password"
                  className="matrix-input w-full pl-10 pr-4 py-3 bg-transparent border rounded-lg focus:ring-2 focus:ring-matrix-green focus:border-transparent"
                  placeholder="Neural passphrase"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm entropy-text">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full reality-button py-3 px-4 rounded-lg font-semibold hover-glow disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Initialize Connection'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              New to the matrix?{' '}
              <Link to="/register" className="matrix-text hover:underline">
                Create neural profile
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