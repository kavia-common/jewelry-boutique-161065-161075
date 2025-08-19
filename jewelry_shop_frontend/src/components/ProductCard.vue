<script setup lang="ts">
import type { Product } from '@/api/types'
import { useRouter } from 'vue-router'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  (e: 'add-to-cart', product: Product): void
}>()

const router = useRouter()

const openDetail = () => {
  router.push({ name: 'product-detail', params: { id: props.product.id } })
}
</script>

<template>
  <div class="card">
    <div class="image" @click="openDetail">
      <img :src="product.image_url || 'https://via.placeholder.com/300x200?text=Jewelry'" :alt="product.name" />
    </div>
    <div class="content">
      <h4 class="name" @click="openDetail">{{ product.name }}</h4>
      <div class="footer">
        <div class="price">${{ product.price?.toFixed(2) }}</div>
        <button class="add" @click="emit('add-to-cart', product)">Add</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
}
.image {
  width: 100%;
  aspect-ratio: 16 / 10;
  background: #f5f5f5;
  cursor: pointer;
}
.image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.content {
  padding: 10px;
}
.name {
  margin: 0 0 8px 0;
  font-weight: 600;
  cursor: pointer;
}
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.price {
  color: #333;
}
.add {
  background: #B19CD9;
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}
.add:hover {
  filter: brightness(0.95);
}
@media (prefers-color-scheme: dark) {
  .card {
    background: var(--color-background-soft);
  }
}
</style>
