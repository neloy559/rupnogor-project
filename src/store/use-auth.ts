import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  createdAt?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  getAuthHeaders: () => Record<string, string>
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('rl_token') : null,
  isLoading: false,

  getAuthHeaders: (): Record<string, string> => {
    const token = get().token
    return token ? { Authorization: `Bearer ${token}` } : {}
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        set({ isLoading: false })
        return { success: false, error: error.message || 'Login failed' }
      }

      if (!data.user) {
        set({ isLoading: false })
        return { success: false, error: 'Login failed' }
      }

      // Store the Supabase access token for getAuthHeaders() backward compatibility
      const accessToken = data.session?.access_token || ''
      localStorage.setItem('rl_token', accessToken)

      // Fetch the full user record (with role) from our API
      const meRes = await fetch('/api/auth/me')
      if (meRes.ok) {
        const meData = await meRes.json()
        set({ user: meData.user, token: accessToken, isLoading: false })
      } else {
        // Supabase login succeeded but we couldn't fetch the app user record
        set({ user: { id: data.user.id, email: data.user.email!, name: data.user.user_metadata?.name || null, phone: data.user.user_metadata?.phone || null, role: 'customer' }, token: accessToken, isLoading: false })
      }

      return { success: true }
    } catch {
      set({ isLoading: false })
      return { success: false, error: 'Network error' }
    }
  },

  register: async (email: string, password: string, name?: string) => {
    set({ isLoading: true })
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || null,
          },
        },
      })

      if (error) {
        set({ isLoading: false })
        return { success: false, error: error.message || 'Registration failed' }
      }

      if (!data.user) {
        set({ isLoading: false })
        return { success: false, error: 'Registration failed' }
      }

      // If email confirmation is required, session may be null
      const accessToken = data.session?.access_token || ''
      if (accessToken) {
        localStorage.setItem('rl_token', accessToken)
      }

      // Try to fetch the user record (may fail if email confirmation is required)
      if (data.session) {
        const meRes = await fetch('/api/auth/me')
        if (meRes.ok) {
          const meData = await meRes.json()
          set({ user: meData.user, token: accessToken, isLoading: false })
          return { success: true }
        }
      }

      // Email confirmation likely required — set a minimal user object
      set({
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: name || null,
          phone: null,
          role: 'customer',
        },
        token: accessToken,
        isLoading: false,
      })
      return { success: true }
    } catch {
      set({ isLoading: false })
      return { success: false, error: 'Network error' }
    }
  },

  logout: async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // Sign-out may fail if no session exists — that's fine
    }
    localStorage.removeItem('rl_token')
    set({ user: null, token: null })
  },

  fetchMe: async () => {
    const token = get().token
    try {
      // First try with Supabase cookies (no auth header needed — middleware refreshes the session)
      // If the user has a valid Supabase session, the server's authenticateRequest will pick it up
      const cookieRes = await fetch('/api/auth/me')
      if (cookieRes.ok) {
        const data = await cookieRes.json()
        if (data.user) {
          set({ user: data.user })
          // Also update the stored token from the Supabase session if possible
          try {
            const supabase = createClient()
            const { data: sessionData } = await supabase.auth.getSession()
            if (sessionData.session?.access_token) {
              const newToken = sessionData.session.access_token
              localStorage.setItem('rl_token', newToken)
              set({ token: newToken })
            }
          } catch {
            // Non-critical — just keep the existing token
          }
          return
        }
      }

      // Fallback: try with Bearer token (legacy support)
      if (!token) return
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        set({ user: data.user })
      } else {
        localStorage.removeItem('rl_token')
        set({ user: null, token: null })
      }
    } catch {
      // Silent fail on network error
    }
  },
}))