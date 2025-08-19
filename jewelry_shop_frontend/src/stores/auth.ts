import { defineStore } from 'pinia'
import { http, setAuthToken, AUTH_TOKEN_KEY } from '@/api/http'
import type { AuthLoginPayload, AuthRegisterPayload, AuthLoginResponse, User } from '@/api/types'
import { isAxiosError } from 'axios'

interface AuthState {
  token: string | null
  user: User | null
  loading: boolean
  error: string | null
}

type ApiErrorPayload = {
  message?: string
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const payload = error.response?.data as ApiErrorPayload | undefined
    return payload?.message || error.message || fallback
  }
  if (error instanceof Error) {
    return error.message || fallback
  }
  return fallback
}

// PUBLIC_INTERFACE
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    /** Whether a user is authenticated. */
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    /** Initialize store by restoring token from localStorage and fetching profile. */
    async init() {
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (token) {
        this.token = token
        setAuthToken(token)
        try {
          await this.fetchMe()
        } catch {
          // token invalid
          this.logout()
        }
      }
    },

    /** Login with email/password and fetch profile. */
    async login(payload: AuthLoginPayload) {
      this.loading = true
      this.error = null
      try {
        const { data } = await http.post<AuthLoginResponse>('/auth/login', payload)
        this.token = data.token
        setAuthToken(data.token)
        await this.fetchMe()
      } catch (error: unknown) {
        this.error = getErrorMessage(error, 'Failed to login')
        throw error
      } finally {
        this.loading = false
      }
    },

    /** Register then login. */
    async register(payload: AuthRegisterPayload) {
      this.loading = true
      this.error = null
      try {
        await http.post('/auth/register', payload)
        await this.login({ email: payload.email, password: payload.password })
      } catch (error: unknown) {
        this.error = getErrorMessage(error, 'Failed to register')
        throw error
      } finally {
        this.loading = false
      }
    },

    /** Fetch current user's profile. Requires auth token. */
    async fetchMe() {
      try {
        const { data } = await http.get<User>('/auth/me')
        this.user = data
      } catch (error: unknown) {
        this.user = null
        throw error
      }
    },

    /** Clear auth token and profile info. */
    logout() {
      this.token = null
      this.user = null
      setAuthToken(null)
    },
  },
})
