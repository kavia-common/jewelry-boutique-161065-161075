<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const mode = ref<'login' | 'register'>('login')
const loginForm = reactive({ email: '', password: '' })
const registerForm = reactive({ name: '', email: '', password: '' })

const doLogin = async () => {
  await auth.login({ email: loginForm.email, password: loginForm.password })
  const redirect = (route.query.redirect as string) || '/profile'
  router.replace(redirect)
}
const doRegister = async () => {
  await auth.register({ email: registerForm.email, password: registerForm.password, name: registerForm.name })
  const redirect = (route.query.redirect as string) || '/profile'
  router.replace(redirect)
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
      <div class="links">
        <RouterLink class="link" :to="{ name: 'orders' }">Order history</RouterLink>
        <RouterLink class="link" :to="{ name: 'stores' }">Store locator</RouterLink>
      </div>
      <button @click="doLogout">Logout</button>
    </div>

    <div v-else>
      <div class="tabs">
        <button :class="{ active: mode === 'login' }" @click="mode = 'login'">Login</button>
        <button :class="{ active: mode === 'register' }" @click="mode = 'register'">Register</button>
      </div>

      <form v-if="mode === 'login'" class="login" @submit.prevent="doLogin">
        <label>
          Email
          <input v-model="loginForm.email" type="email" placeholder="you@example.com" required />
        </label>
        <label>
          Password
          <input v-model="loginForm.password" type="password" placeholder="********" required />
        </label>
        <button class="primary" type="submit" :disabled="auth.loading">Login</button>
        <div class="error" v-if="auth.error">{{ auth.error }}</div>
      </form>

      <form v-else class="login" @submit.prevent="doRegister">
        <label>
          Name
          <input v-model="registerForm.name" type="text" placeholder="Jane Doe" />
        </label>
        <label>
          Email
          <input v-model="registerForm.email" type="email" placeholder="you@example.com" required />
        </label>
        <label>
          Password
          <input v-model="registerForm.password" type="password" placeholder="********" required />
        </label>
        <button class="primary" type="submit" :disabled="auth.loading">Create account</button>
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
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.tabs button {
  flex: 1;
  border: 1px solid var(--color-border);
  background: #fff;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
}
.tabs button.active {
  background: #B19CD9;
  color: #fff;
}
.links {
  display: flex;
  gap: 10px;
  margin: 10px 0 16px;
}
.link {
  padding: 6px 10px;
  border-radius: 8px;
  background: #eee;
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
@media (prefers-color-scheme: dark) {
  .tabs button { background: var(--color-background-soft); }
  .link { background: var(--color-background-soft); }
}
</style>
