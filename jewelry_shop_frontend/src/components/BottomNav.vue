<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()

const isActive = (path: string) => route.path === path || route.path.startsWith(path + '/')
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink :class="{ active: isActive('/') }" to="/">Home</RouterLink>
    <RouterLink :class="{ active: isActive('/categories') }" to="/categories">Categories</RouterLink>
    <RouterLink :class="{ active: isActive('/cart') }" to="/cart">Cart</RouterLink>
    <RouterLink :class="{ active: isActive('/profile') }" to="/profile">Profile</RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: #fff;
  border-top: 1px solid var(--color-border);
  align-items: center;
  text-align: center;
  z-index: 1000;
}

.bottom-nav a {
  color: var(--color-text);
  text-decoration: none;
  padding: 8px;
}

.bottom-nav a.active {
  color: #B19CD9;
  font-weight: 600;
}

@media (prefers-color-scheme: dark) {
  .bottom-nav {
    background: var(--color-background-soft);
  }
}
</style>
