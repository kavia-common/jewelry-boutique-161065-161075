<script setup lang="ts">
import type { CartLineItem } from '@/api/types'

const props = defineProps<{
  item: CartLineItem
}>()

const emit = defineEmits<{
  (e: 'update-qty', payload: { quantity: number }): void
  (e: 'remove'): void
}>()

const increase = () => emit('update-qty', { quantity: (props.item.quantity || 0) + 1 })
const decrease = () => emit('update-qty', { quantity: Math.max(0, (props.item.quantity || 0) - 1) })
</script>

<template>
  <div class="cart-item">
    <div class="left">
      <img
        class="thumb"
        :src="item.product?.image_url || 'https://via.placeholder.com/80?text=Item'"
        :alt="item.product?.name || ('Product #' + item.product_id)"
      />
      <div>
        <div class="name">{{ item.product?.name || ('Product #' + item.product_id) }}</div>
        <div class="price" v-if="item.product"> ${{ item.product?.price?.toFixed(2) }} </div>
      </div>
    </div>
    <div class="right">
      <div class="qty">
        <button @click="decrease">-</button>
        <span>{{ item.quantity }}</span>
        <button @click="increase">+</button>
      </div>
      <button class="remove" @click="$emit('remove')">Remove</button>
    </div>
  </div>
</template>

<style scoped>
.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--color-border);
  padding: 10px;
  border-radius: 8px;
  gap: 10px;
  background: #fff;
}
.left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}
.thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 6px;
  background: #f5f5f5;
}
.right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.qty {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--color-border);
  padding: 4px 6px;
  border-radius: 6px;
}
.qty button {
  border: none;
  background: #eee;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
}
.remove {
  border: none;
  background: #FFDAB9;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}
@media (prefers-color-scheme: dark) {
  .cart-item {
    background: var(--color-background-soft);
  }
  .qty button {
    background: #444;
    color: #fff;
  }
}
</style>
