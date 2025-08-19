<script setup lang="ts">
import { onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import CartItem from '@/components/CartItem.vue'

const cartStore = useCartStore()

onMounted(async () => {
  await cartStore.loadCart()
})

const updateQty = async (idx: number, quantity: number) => {
  const item = cartStore.items[idx]
  // Prefer server itemId if available, otherwise use product_id for guest cart
  await cartStore.updateItemQuantity({
    itemId: item.id,
    product_id: item.product_id,
    quantity,
  })
}

const removeItem = async (idx: number) => {
  const item = cartStore.items[idx]
  await cartStore.removeItem({ itemId: item.id, product_id: item.product_id })
}
</script>

<template>
  <div>
    <h2>Your Cart</h2>
    <div v-if="cartStore.loading">Loading cart...</div>
    <div v-else>
      <div v-if="cartStore.items.length === 0">Your cart is empty.</div>
      <div class="list">
        <CartItem
          v-for="(it, idx) in cartStore.items"
          :key="it.id ?? it.product_id"
          :item="it"
          @update-qty="({ quantity }) => updateQty(idx, quantity)"
          @remove="() => removeItem(idx)"
        />
      </div>
      <div class="summary" v-if="cartStore.items.length > 0">
        <div>Total: ${{ cartStore.totalPrice.toFixed(2) }}</div>
        <RouterLink class="checkout" :to="{ name: 'checkout' }">Proceed to Checkout</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
h2 {
  margin-bottom: 12px;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.summary {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.checkout {
  background: #FFD700;
  color: #333;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}
</style>
