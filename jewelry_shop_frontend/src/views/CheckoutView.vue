<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { http } from '@/api/http'
import type { CheckoutIntentResponse } from '@/api/types'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { loadScriptOnce } from '@/utils/loadScript'
import { isAxiosError } from 'axios'

/** Minimal Stripe types to avoid external type package and 'any' usage */
type StripeCardElement = {
  mount: (el: HTMLElement) => void
}
type StripeElements = {
  create: (type: 'card') => StripeCardElement
}
type StripeInstance = {
  elements: () => StripeElements
  confirmCardPayment: (
    clientSecret: string,
    data: { payment_method: { card: StripeCardElement } }
  ) => Promise<{
    paymentIntent?: { id?: string; status?: string }
    error?: { message?: string }
  }>
}
type StripeFactory = (key: string) => StripeInstance

const getStripeFromWindow = (): StripeFactory | undefined => {
  return (window as unknown as { Stripe?: StripeFactory }).Stripe
}

const router = useRouter()
const cart = useCartStore()

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripe = ref<StripeInstance | null>(null)
const cardElement = ref<StripeCardElement | null>(null)
const clientSecret = ref<string | null>(null)
const orderId = ref<number | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const paymentAvailable = ref<boolean>(!!stripeKey)

const cardMountEl = ref<HTMLDivElement | null>(null)

onMounted(async () => {
  // Create PaymentIntent + order
  try {
    const { data } = await http.post<CheckoutIntentResponse>('/orders/checkout')
    clientSecret.value = (data.client_secret as string | undefined) ?? null
    orderId.value = typeof data.order_id === 'number' ? data.order_id : null
  } catch (e: unknown) {
    if (isAxiosError(e)) {
      error.value = e.response?.data?.message || e.message || 'Checkout initialization failed'
    } else if (e instanceof Error) {
      error.value = e.message || 'Checkout initialization failed'
    } else {
      error.value = 'Checkout initialization failed'
    }
  }

  // Setup Stripe Elements via script if key is present
  if (paymentAvailable.value && stripeKey) {
    try {
      await loadScriptOnce('https://js.stripe.com/v3')
      const Stripe = getStripeFromWindow()
      if (Stripe) {
        stripe.value = Stripe(stripeKey)
        if (stripe.value && cardMountEl.value) {
          const elements = stripe.value.elements()
          const card = elements.create('card')
          card.mount(cardMountEl.value)
          cardElement.value = card
        }
      } else {
        paymentAvailable.value = false
      }
    } catch (e: unknown) {
      paymentAvailable.value = false
      console.warn('Stripe failed to initialize', e)
    }
  }
})

const pay = async () => {
  if (!stripe.value || !clientSecret.value || !cardElement.value) return
  loading.value = true
  error.value = null
  try {
    const { paymentIntent, error: stripeError } = await stripe.value.confirmCardPayment(clientSecret.value, {
      payment_method: {
        card: cardElement.value,
      },
    })
    if (stripeError) {
      error.value = stripeError.message || 'Payment failed'
      return
    }
    // Confirm order with backend
    if (orderId.value) {
      await http.post('/orders/confirm', {
        order_id: orderId.value,
        payment_intent_id: paymentIntent?.id,
        status: paymentIntent?.status === 'succeeded' ? 'succeeded' : 'pending',
      })
    }
    await cart.loadCart()
    router.replace({ name: 'orders' })
  } catch (e: unknown) {
    if (isAxiosError(e)) {
      error.value = e.response?.data?.message || e.message || 'Payment failed'
    } else if (e instanceof Error) {
      error.value = e.message || 'Payment failed'
    } else {
      error.value = 'Payment failed'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2>Checkout</h2>
    <p v-if="!paymentAvailable" class="notice">
      Payments are not configured. Please contact support or try again later.
    </p>

    <div class="summary">
      <div>Items: {{ cart.itemCount }}</div>
      <div>Total: ${{ cart.totalPrice.toFixed(2) }}</div>
    </div>

    <div v-if="paymentAvailable">
      <div ref="cardMountEl" class="card-el"></div>
      <button class="primary" :disabled="loading" @click="pay">
        {{ loading ? 'Processing...' : 'Pay now' }}
      </button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<style scoped>
h2 { margin-bottom: 12px; }
.summary {
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
}
.card-el {
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 12px;
  background: #fff;
}
.primary {
  background: #B19CD9;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}
.error { color: #d33; margin-top: 10px; }
.notice {
  background: #fff3cd;
  color: #7a5e00;
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 10px;
}
@media (prefers-color-scheme: dark) {
  .card-el { background: var(--color-background-soft); }
  .notice { background: #332f1b; color: #ffe699; }
}
</style>
