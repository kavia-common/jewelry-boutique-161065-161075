<script setup lang="ts">
import { onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import ProductCard from '@/components/ProductCard.vue'
import type { Product } from '@/api/types'

const productStore = useProductStore()
const cartStore = useCartStore()

onMounted(async () => {
  await productStore.fetchProducts()
})

const addToCart = async (product: Product) => {
  await cartStore.addOrUpdateItem(product.id, 1)
}
</script>

<template>
  <div>
    <h2>Discover Jewelry</h2>
    <div v-if="productStore.loading">Loading products...</div>
    <div v-else-if="productStore.error" class="error">{{ productStore.error }}</div>
    <div class="grid">
      <ProductCard
        v-for="p in productStore.products"
        :key="p.id"
        :product="p"
        @add-to-cart="addToCart"
      />
    </div>
  </div>
</template>

<style scoped>
h2 {
  margin-bottom: 12px;
}
.error {
  color: #d33;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
</style>
