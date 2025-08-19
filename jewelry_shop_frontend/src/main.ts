import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// Initialize stores (non-blocking)
const auth = useAuthStore(pinia)
auth.init()
const cart = useCartStore(pinia)
cart.loadCart()

app.mount('#app')
