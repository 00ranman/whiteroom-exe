import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { 
  User, 
  LogOut, 
  Settings, 
  Users, 
  Globe, 
  Gamepad2,
  Crown,
  Terminal
} from 'lucide-react'

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!isAuthenticated) {
    return (
      <nav className="border-b border-matrix-green border-opacity-30 bg-void bg-opacity-90 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Terminal className="w-8 h-8 text-matrix-green" />
              <span className="matrix-text text-xl font-bold">WhiteRoom.exe</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="reality-button px-4 py-2 rounded"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="matrix-input border border-matrix-green px-4 py-2 rounded"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b border-matrix-green border-opacity-30 bg-void bg-opacity-90 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Terminal className="w-8 h-8 text-matrix-green" />
            <span className="matrix-text text-xl font-bold">WhiteRoom.exe</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-1 text-white-room hover:text-matrix-green transition-colors"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              to="/characters" 
              className="flex items-center space-x-1 text-white-room hover:text-matrix-green transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Characters</span>
            </Link>
            
            <Link 
              to="/worlds" 
              className="flex items-center space-x-1 text-white-room hover:text-matrix-green transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>Worlds</span>
            </Link>
            
            {user?.role === 'architect' && (
              <Link 
                to="/architect" 
                className="flex items-center space-x-1 architect-text hover:text-architect-gold transition-colors"
              >
                <Crown className="w-4 h-4" />
                <span>Architect</span>
              </Link>
            )}
            
            <div className="flex items-center space-x-2 border-l border-matrix-green border-opacity-30 pl-6">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-matrix-green" />
                <span className="text-sm">
                  {user?.username}
                  {user?.role === 'architect' && (
                    <span className="architect-text ml-1">[Architect]</span>
                  )}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-entropy-red hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}