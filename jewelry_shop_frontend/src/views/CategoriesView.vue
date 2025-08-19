<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { http } from '@/api/http'
import type { Category } from '@/api/types'
import { useRouter } from 'vue-router'
import { isAxiosError } from 'axios'

const router = useRouter()
const loading = ref(false)
const error = ref<string | null>(null)
const categories = ref<Category[]>([])

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await http.get<Category[]>('/categories')
    categories.value = Array.isArray(data) ? data : []
  } catch (e: unknown) {
    if (isAxiosError(e)) {
      const msg = (e.response?.data as { message?: string } | undefined)?.message
      error.value = msg || e.message
    } else if (e instanceof Error) {
      error.value = e.message
    } else {
      error.value = 'Failed to load categories'
    }
  } finally {
    loading.value = false
  }
})

const openCategory = (cat: Category) => {
  router.push({ name: 'home', query: { category_id: cat.id } })
}
</script>

<template>
  <div>
    <h2>Categories</h2>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div class="grid">
      <button v-for="c in categories" :key="c.id" class="chip" @click="openCategory(c)">
        {{ c.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
h2 { margin-bottom: 8px; }
.error { color: #d33; }
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
}
@media (prefers-color-scheme: dark) {
  .chip { background: var(--color-background-soft); }
}
</style>
