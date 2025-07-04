import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MatrixBackground } from './components/MatrixBackground'
import { Navigation } from './components/Navigation'

// Pages
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { CharacterCreationPage } from './pages/CharacterCreationPage'
import { CharacterListPage } from './pages/CharacterListPage'
import { WorldCreationPage } from './pages/WorldCreationPage'
import { WorldListPage } from './pages/WorldListPage'
import { GameSessionPage } from './pages/GameSessionPage'
import { ArchitectDashboard } from './pages/ArchitectDashboard'

function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <div className="min-h-screen bg-void text-white-room relative overflow-hidden">
      <MatrixBackground />
      <div className="relative z-10">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="/characters" element={
              <ProtectedRoute>
                <CharacterListPage />
              </ProtectedRoute>
            } />
            
            <Route path="/characters/create" element={
              <ProtectedRoute>
                <CharacterCreationPage />
              </ProtectedRoute>
            } />
            
            <Route path="/worlds" element={
              <ProtectedRoute>
                <WorldListPage />
              </ProtectedRoute>
            } />
            
            <Route path="/worlds/create" element={
              <ProtectedRoute>
                <WorldCreationPage />
              </ProtectedRoute>
            } />
            
            <Route path="/session/:sessionId" element={
              <ProtectedRoute>
                <GameSessionPage />
              </ProtectedRoute>
            } />
            
            {/* Architect-only routes */}
            <Route path="/architect" element={
              <ProtectedRoute requireArchitect>
                <ArchitectDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App