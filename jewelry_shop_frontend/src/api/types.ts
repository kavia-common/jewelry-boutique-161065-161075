export interface User {
  id: number
  email: string
  name?: string
}

export interface AuthLoginPayload {
  email: string
  password: string
}

export interface AuthRegisterPayload {
  email: string
  password: string
  name?: string
}

export interface AuthLoginResponse {
  token: string
}

export interface Category {
  id: number
  name: string
}

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  image_url?: string
  category_id?: number
}

export interface CartLineItem {
  id?: number // Backend cart item id (server cart)
  product_id: number
  quantity: number
  product?: Product
}

export interface Cart {
  items: CartLineItem[]
  total?: number
}

export interface PaginatedProducts {
  items: Product[]
  page: number
  page_size: number
  total: number
}

/** Order-related types */
export interface OrderItem {
  product_id: number
  quantity: number
  price: number
  product?: Product
}

export interface Order {
  id: number
  status: 'pending' | 'succeeded' | 'failed' | string
  total: number
  created_at?: string
  items?: OrderItem[]
}

/** Response from POST /orders/checkout */
export interface CheckoutIntentResponse {
  client_secret?: string
  order_id?: number
  // allow extra fields from backend
  [key: string]: unknown
}

/** Store locator types */
export interface StoreLocation {
  id: number
  name: string
  address?: string
  lat?: number
  lng?: number
  phone?: string
}
