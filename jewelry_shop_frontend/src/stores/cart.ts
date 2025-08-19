import { defineStore } from 'pinia'
import { http } from '@/api/http'
import type { CartLineItem } from '@/api/types'
import { useAuthStore } from './auth'
import { isAxiosError } from 'axios'

const GUEST_CART_KEY = 'guest_cart'

type CartResponse = { items: CartLineItem[] } | CartLineItem[]

function normalizeCartItems(data: CartResponse | undefined | null): CartLineItem[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if ('items' in data && Array.isArray(data.items)) return data.items
  return []
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

interface CartState {
  items: CartLineItem[]
  loading: boolean
  error: string | null
}

// PUBLIC_INTERFACE
export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    /** Total item count in the cart. */
    itemCount: (state) => state.items.reduce((acc, it) => acc + (it.quantity || 0), 0),
    /** Total price if product.price is available on items. */
    totalPrice: (state) =>
      state.items.reduce((sum, it) => sum + (it.product?.price || 0) * (it.quantity || 0), 0),
  },

  actions: {
    /** Load cart from server or localStorage depending on auth state. */
    async loadCart() {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      try {
        if (auth.isAuthenticated) {
          const { data } = await http.get<CartResponse>('/cart')
          this.items = normalizeCartItems(data)
        } else {
          this.items = this.readGuestCart()
        }
      } catch (error: unknown) {
        this.error = getErrorMessage(error, 'Failed to load cart')
      } finally {
        this.loading = false
      }
    },

    /** Add or update item by product id. Uses server when authenticated, or local fallback. */
    async addOrUpdateItem(product_id: number, quantity: number) {
      const auth = useAuthStore()
      if (quantity < 1) quantity = 1
      this.loading = true
      this.error = null
      try {
        if (auth.isAuthenticated) {
          const { data } = await http.post<CartResponse>('/cart/items', { product_id, quantity })
          this.items = normalizeCartItems(data)
        } else {
          const items = this.readGuestCart()
          const existing = items.find((i) => i.product_id === product_id)
          if (existing) {
            existing.quantity = quantity
          } else {
            items.push({ product_id, quantity })
          }
          this.items = items
          this.writeGuestCart(items)
        }
      } catch (error: unknown) {
        this.error = getErrorMessage(error, 'Failed to add item')
      } finally {
        this.loading = false
      }
    },

    /** Update a server cart item by item id, or guest cart by product id. */
    async updateItemQuantity({ itemId, product_id, quantity }: { itemId?: number; product_id?: number; quantity: number }) {
      const auth = useAuthStore()
      if (quantity < 0) quantity = 0
      this.loading = true
      this.error = null
      try {
        if (auth.isAuthenticated && itemId != null) {
          const { data } = await http.patch<CartResponse>(`/cart/items/${itemId}`, { quantity })
          this.items = normalizeCartItems(data)
        } else if (!auth.isAuthenticated && product_id != null) {
          const items = this.readGuestCart()
          const existing = items.find((i) => i.product_id === product_id)
          if (existing) {
            existing.quantity = quantity
            const next = existing.quantity <= 0 ? items.filter((i) => i.product_id !== product_id) : items
            this.items = next
            this.writeGuestCart(this.items)
          }
        }
      } catch (error: unknown) {
        this.error = getErrorMessage(error, 'Failed to update item')
      } finally {
        this.loading = false
      }
    },

    /** Remove a server cart item by item id, or guest cart by product id. */
    async removeItem({ itemId, product_id }: { itemId?: number; product_id?: number }) {
      const auth = useAuthStore()
      this.loading = true
      this.error = null
      try {
        if (auth.isAuthenticated && itemId != null) {
          const { data } = await http.delete<CartResponse>(`/cart/items/${itemId}`)
          this.items = normalizeCartItems(data)
        } else if (!auth.isAuthenticated && product_id != null) {
          const items = this.readGuestCart().filter((i) => i.product_id !== product_id)
          this.items = items
          this.writeGuestCart(items)
        }
      } catch (error: unknown) {
        this.error = getErrorMessage(error, 'Failed to remove item')
      } finally {
        this.loading = false
      }
    },

    /** Local guest cart helpers */
    readGuestCart(): CartLineItem[] {
      try {
        const raw = localStorage.getItem(GUEST_CART_KEY)
        if (!raw) return []
        return JSON.parse(raw) as CartLineItem[]
      } catch {
        return []
      }
    },
    writeGuestCart(items: CartLineItem[]) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
    },
    clearGuestCart() {
      localStorage.removeItem(GUEST_CART_KEY)
    },
  },
})
