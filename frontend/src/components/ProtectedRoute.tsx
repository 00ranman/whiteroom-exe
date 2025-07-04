import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  children: ReactNode
  requireArchitect?: boolean
}

export function ProtectedRoute({ children, requireArchitect = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireArchitect && user?.role !== 'architect') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="void-panel p-8 rounded-lg text-center">
          <h1 className="text-2xl entropy-text mb-4">Access Denied</h1>
          <p className="text-white-room mb-4">
            This area requires Architect privileges.
          </p>
          <p className="text-gray-400 text-sm">
            Only those who can manipulate the very fabric of reality may enter.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}