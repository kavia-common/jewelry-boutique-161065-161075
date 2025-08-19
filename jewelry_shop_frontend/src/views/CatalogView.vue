<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import ProductCard from '@/components/ProductCard.vue'
import type { Product } from '@/api/types'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'

const productStore = useProductStore()
const cartStore = useCartStore()
const route = useRoute()
const router = useRouter()

function parseSort(val: unknown): 'price_asc' | 'price_desc' | '' {
  return val === 'price_asc' || val === 'price_desc' ? val : ''
}

const search = ref<string>((route.query.search as string) || '')
const sort = ref<'price_asc' | 'price_desc' | ''>(parseSort(route.query.sort))

async function load() {
  await productStore.fetchProducts({
    search: search.value || undefined,
    category_id: route.query.category_id ? Number(route.query.category_id) : undefined,
    sort: sort.value || undefined,
  })
}

onMounted(async () => {
  await load()
})

watch(
  () => [route.query.category_id, route.query.search, route.query.sort],
  async () => {
    search.value = (route.query.search as string) || ''
    sort.value = parseSort(route.query.sort)
    await load()
  },
)

const onSubmit = async () => {
  const q: LocationQueryRaw = {
    ...route.query,
    search: search.value || undefined,
    sort: sort.value || undefined,
  }
  await router.replace({ name: 'home', query: q })
}

const clearFilters = async () => {
  search.value = ''
  sort.value = ''
  const entries = Object.entries(route.query).filter(([k]) => k !== 'search' && k !== 'sort')
  const q: LocationQueryRaw = Object.fromEntries(entries) as LocationQueryRaw
  await router.replace({ name: 'home', query: q })
}

const addToCart = async (product: Product) => {
  await cartStore.addOrUpdateItem(product.id, 1)
}
</script>

<template>
  <div>
    <h2>Discover Jewelry</h2>

    <form class="filters" @submit.prevent="onSubmit">
      <input v-model="search" type="search" placeholder="Search rings, necklaces..." />
      <select v-model="sort">
        <option value="">Sort</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
      <button class="primary" type="submit">Apply</button>
      <button type="button" class="secondary" @click="clearFilters">Clear</button>
    </form>

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
.filters {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 8px;
  margin-bottom: 12px;
}
.filters input,
.filters select {
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}
.primary {
  background: #B19CD9;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.secondary {
  background: #eee;
  color: #333;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
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
