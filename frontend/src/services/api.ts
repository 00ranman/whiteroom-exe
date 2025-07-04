import axios from 'axios'
import { Character, WorldModule, GameSession, User } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage')
  if (token) {
    try {
      const parsed = JSON.parse(token)
      if (parsed.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`
      }
    } catch (e) {
      console.error('Error parsing auth token:', e)
    }
  }
  return config
})

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password })
    return response.data
  },

  register: async (username: string, email: string, password: string, role: 'player' | 'architect') => {
    const response = await api.post('/auth/register', { username, email, password, role })
    return response.data
  },

  verify: async (token: string) => {
    const response = await api.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  }
}

// Characters API
export const charactersApi = {
  getAll: async (): Promise<Character[]> => {
    const response = await api.get('/characters')
    return response.data
  },

  getById: async (id: string): Promise<Character> => {
    const response = await api.get(`/characters/${id}`)
    return response.data
  },

  create: async (data: { backstory: string; personalityTraits: string; domainWeights?: Record<string, number> }): Promise<Character> => {
    const response = await api.post('/characters', data)
    return response.data
  },

  update: async (id: string, data: Partial<Character>): Promise<Character> => {
    const response = await api.put(`/characters/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/characters/${id}`)
  },

  generateImage: async (id: string): Promise<{ imageUrl: string }> => {
    const response = await api.post(`/characters/${id}/image`)
    return response.data
  },

  train: async (id: string, data: { trainingData: string; focusAreas: string[] }) => {
    const response = await api.post(`/characters/${id}/train`, data)
    return response.data
  }
}

// Worlds API
export const worldsApi = {
  getAll: async (): Promise<WorldModule[]> => {
    const response = await api.get('/worlds')
    return response.data
  },

  getPublic: async (): Promise<WorldModule[]> => {
    const response = await api.get('/worlds/public')
    return response.data
  },

  getById: async (id: string): Promise<WorldModule> => {
    const response = await api.get(`/worlds/${id}`)
    return response.data
  },

  create: async (data: { genre: string; parentWorldId?: string; constraints?: string[] }): Promise<WorldModule> => {
    const response = await api.post('/worlds', data)
    return response.data
  },

  update: async (id: string, data: Partial<WorldModule>): Promise<WorldModule> => {
    const response = await api.put(`/worlds/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/worlds/${id}`)
  },

  getNested: async (id: string): Promise<WorldModule[]> => {
    const response = await api.get(`/worlds/${id}/nested`)
    return response.data
  },

  clone: async (id: string, newName?: string): Promise<WorldModule> => {
    const response = await api.post(`/worlds/${id}/clone`, { newName })
    return response.data
  },

  expand: async (id: string, data: { direction: string; theme: string }): Promise<WorldModule> => {
    const response = await api.post(`/worlds/${id}/expand`, data)
    return response.data
  }
}

// Game Sessions API
export const gameApi = {
  getSessions: async (): Promise<GameSession[]> => {
    const response = await api.get('/game/sessions')
    return response.data
  },

  getSession: async (id: string): Promise<GameSession> => {
    const response = await api.get(`/game/sessions/${id}`)
    return response.data
  },

  createSession: async (data: { players: string[] }): Promise<GameSession> => {
    const response = await api.post('/game/sessions', data)
    return response.data
  },

  updateSession: async (id: string, data: Partial<GameSession>): Promise<GameSession> => {
    const response = await api.put(`/game/sessions/${id}`, data)
    return response.data
  },

  deleteSession: async (id: string): Promise<void> => {
    await api.delete(`/game/sessions/${id}`)
  },

  getEvents: async (sessionId: string, limit = 50, offset = 0) => {
    const response = await api.get(`/game/sessions/${sessionId}/events`, {
      params: { limit, offset }
    })
    return response.data
  },

  addEvent: async (sessionId: string, data: { type: string; content: string; reality_impact?: number }) => {
    const response = await api.post(`/game/sessions/${sessionId}/events`, data)
    return response.data
  },

  getAudits: async (sessionId: string) => {
    const response = await api.get(`/game/sessions/${sessionId}/audits`)
    return response.data
  },

  createAudit: async (sessionId: string, data: { command: any; player_justification: string }) => {
    const response = await api.post(`/game/sessions/${sessionId}/audits`, data)
    return response.data
  },

  resolveAudit: async (sessionId: string, auditId: string, data: { resolution: string; ai_justification: string; modifications?: any }) => {
    const response = await api.put(`/game/sessions/${sessionId}/audits/${auditId}`, data)
    return response.data
  },

  getStats: async (sessionId: string) => {
    const response = await api.get(`/game/sessions/${sessionId}/stats`)
    return response.data
  }
}

export default api