import { defineStore } from 'pinia'
import { http } from '@/api/http'
import type { Product } from '@/api/types'
import { isAxiosError } from 'axios'

interface ProductState {
  products: Product[]
  current: Product | null
  loading: boolean
  error: string | null
  page: number
  page_size: number
  total: number
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
export const useProductStore = defineStore('product', {
  state: (): ProductState => ({
    products: [],
    current: null,
    loading: false,
    error: null,
    page: 1,
    page_size: 20,
    total: 0,
  }),

  actions: {
    /**
     * Fetch a list of products with optional search and category filters.
     * Params align with the backend OpenAPI: search, category_id, sort, page, page_size
     */
    async fetchProducts(params?: {
      search?: string
      category_id?: number
      sort?: 'price_asc' | 'price_desc'
      page?: number
      page_size?: number
    }) {
      this.loading = true
      this.error = null
      try {
        const { data } = await http.get<Product[]>('/products', { params })
        // Backend spec doesn't define pagination envelope, so assume array.
        this.products = Array.isArray(data) ? data : []
      } catch (error: unknown) {
        this.error = getErrorMessage(error, 'Failed to load products')
        this.products = []
      } finally {
        this.loading = false
      }
    },

    /** Fetch a product by id and set as current. */
    async fetchProduct(id: number | string) {
      this.loading = true
      this.error = null
      try {
        const { data } = await http.get<Product>(`/products/${id}`)
        this.current = data
      } catch (error: unknown) {
        this.current = null
        this.error = getErrorMessage(error, 'Failed to load product')
      } finally {
        this.loading = false
      }
    },
  },
})
