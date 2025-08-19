<script setup lang="ts">
import { RouterView } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
</script>

<template>
  <div class="app-shell">
    <main class="content">
      <RouterView />
    </main>
    <BottomNav />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding-bottom: 56px; /* bottom nav height */
}
.content {
  padding: 16px;
}
</style>
