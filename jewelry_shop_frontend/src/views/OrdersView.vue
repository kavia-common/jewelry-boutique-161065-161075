<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { http } from '@/api/http'
import type { Order } from '@/api/types'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const error = ref<string | null>(null)
const orders = ref<Order[]>([])

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await http.get<Order[]>('/orders')
    orders.value = Array.isArray(data) ? data : []
  } catch (e: unknown) {
    // If unauthorized, redirect to login
    if (typeof e === 'object' && e !== null && 'response' in e) {
      const resp = (e as { response?: { status?: number; data?: { message?: string } } }).response
      if (resp?.status === 401) {
        router.replace({ name: 'profile', query: { redirect: '/orders' } })
        return
      }
      error.value = resp?.data?.message || 'Failed to load orders'
    } else if (e instanceof Error) {
      error.value = e.message
    } else {
      error.value = 'Failed to load orders'
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h2>Your Orders</h2>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-if="orders.length === 0">No orders yet.</div>
      <ul class="list">
        <li class="order" v-for="o in orders" :key="o.id">
          <div class="row">
            <strong>#{{ o.id }}</strong>
            <span class="status">{{ o.status }}</span>
          </div>
          <div class="row">
            <span>{{ new Date(o.created_at || Date.now()).toLocaleString() }}</span>
            <span>Total: ${{ o.total?.toFixed(2) }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
h2 { margin-bottom: 12px; }
.error { color: #d33; }
.list {
  display: grid;
  gap: 10px;
  padding: 0;
  list-style: none;
}
.order {
  border: 1px solid var(--color-border);
  padding: 10px;
  border-radius: 8px;
  background: #fff;
}
.row {
  display: flex;
  justify-content: space-between;
}
.status {
  text-transform: capitalize;
}
@media (prefers-color-scheme: dark) {
  .order { background: var(--color-background-soft); }
}
</style>
