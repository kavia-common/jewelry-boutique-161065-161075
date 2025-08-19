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
