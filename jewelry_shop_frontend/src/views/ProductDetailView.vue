<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const productStore = useProductStore()
const cartStore = useCartStore()

const productId = Number(route.params.id)

onMounted(async () => {
  await productStore.fetchProduct(productId)
})

const product = computed(() => productStore.current)

const addToCart = async () => {
  if (!product.value) return
  await cartStore.addOrUpdateItem(product.value.id, 1)
}
</script>

<template>
  <div v-if="product">
    <img
      class="hero"
      :src="product.image_url || 'https://via.placeholder.com/800x500?text=Jewelry'"
      :alt="product.name"
    />
    <h2>{{ product.name }}</h2>
    <div class="price">${{ product.price?.toFixed(2) }}</div>
    <p class="desc">{{ product.description }}</p>
    <button class="primary" @click="addToCart">Add to Cart</button>
  </div>
  <div v-else>
    Loading...
  </div>
</template>

<style scoped>
.hero {
  width: 100%;
  border-radius: 10px;
  margin-bottom: 12px;
  object-fit: cover;
}
.price {
  font-size: 1.2rem;
  margin-bottom: 8px;
}
.desc {
  margin-bottom: 12px;
}
.primary {
  background: #B19CD9;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}
</style>
