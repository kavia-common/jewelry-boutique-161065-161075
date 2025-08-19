import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import { AUTH_TOKEN_KEY } from '@/api/http'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/CatalogView.vue'),
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('@/views/CategoriesView.vue'),
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: () => import('@/views/ProductDetailView.vue'),
      props: true,
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/CartView.vue'),
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/CheckoutView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/OrdersView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/stores',
      name: 'stores',
      component: () => import('@/views/StoreLocatorView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
    },
  ],
})

 // Simple auth guard using localStorage token
router.beforeEach((to: RouteLocationNormalized) => {
  const requiresAuth = (to.meta as { requiresAuth?: boolean }).requiresAuth === true
  if (requiresAuth) {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) {
      return { name: 'profile', query: { redirect: to.fullPath } }
    }
  }
  return true
})

export default router
