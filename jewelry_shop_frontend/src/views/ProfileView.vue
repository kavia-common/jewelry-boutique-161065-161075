<script setup lang="ts">
import { reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const form = reactive({
  email: '',
  password: '',
})

const doLogin = async () => {
  await auth.login({ email: form.email, password: form.password })
}
const doLogout = () => auth.logout()

// Initialize auth from local storage if not done already
if (auth.token === null) {
  auth.init()
}
</script>

<template>
  <div>
    <h2>Profile</h2>
    <div v-if="auth.isAuthenticated && auth.user">
      <p>Welcome, {{ auth.user.name || auth.user.email }}!</p>
      <button @click="doLogout">Logout</button>
    </div>
    <div v-else>
      <form class="login" @submit.prevent="doLogin">
        <label>
          Email
          <input v-model="form.email" type="email" placeholder="you@example.com" required />
        </label>
        <label>
          Password
          <input v-model="form.password" type="password" placeholder="********" required />
        </label>
        <button class="primary" type="submit" :disabled="auth.loading">Login</button>
        <div class="error" v-if="auth.error">{{ auth.error }}</div>
      </form>
    </div>
  </div>
</template>

<style scoped>
h2 { margin-bottom: 12px; }
.login {
  display: grid;
  gap: 10px;
  max-width: 400px;
}
input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}
.primary {
  background: #B19CD9;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}
.error { color: #d33; }
</style>
