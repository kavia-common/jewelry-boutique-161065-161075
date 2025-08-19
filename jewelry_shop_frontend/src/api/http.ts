import axios, { type AxiosError, type AxiosInstance } from 'axios'

/**
 * Centralized Axios HTTP client for the app.
 * - Reads base URL from VITE_API_BASE_URL
 * - Automatically attaches Bearer token from localStorage if present
 * - Handles 401 errors and emits events for global handling if needed
 */

// Key used to persist JWT in localStorage by the auth store
export const AUTH_TOKEN_KEY = 'auth_token'

const baseURL = import.meta.env.VITE_API_BASE_URL || ''

const http: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
})

// Attach Authorization header from localStorage if token exists
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Simple response interceptor to log and forward errors
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Optionally notify listeners here. We avoid importing stores to prevent circular deps.
      // window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    return Promise.reject(error)
  },
)

/**
 * Helper to programmatically set or clear the default auth token.
 * Useful immediately after login/logout to keep axios in sync.
 */
// PUBLIC_INTERFACE
export function setAuthToken(token: string | null): void {
  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  } else {
    delete http.defaults.headers.common.Authorization
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

// PUBLIC_INTERFACE
export { http }
