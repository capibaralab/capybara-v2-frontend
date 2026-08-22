<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logo from '../assets/logo.png'
import { unlockDevGate } from '../services/devGate'

const router = useRouter()
const route = useRoute()
const username = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

function onSubmit() {
  error.value = ''
  submitting.value = true
  const ok = unlockDevGate(username.value, password.value)
  submitting.value = false
  if (!ok) {
    error.value = 'Invalid username or password.'
    return
  }
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  router.replace(redirect || '/')
}
</script>

<template>
  <main class="gate">
    <form class="gate-card" @submit.prevent="onSubmit">
      <img :src="logo" alt="" class="gate-logo" />
      <h1>Capybara Lab AI</h1>
      <p class="gate-sub">Dev access only — sign in to continue testing.</p>

      <label class="gate-field">
        <span>Username</span>
        <input v-model="username" type="text" autocomplete="username" autofocus required />
      </label>

      <label class="gate-field">
        <span>Password</span>
        <input v-model="password" type="password" autocomplete="current-password" required />
      </label>

      <p v-if="error" class="gate-error" role="alert">{{ error }}</p>

      <button class="btn btn-primary cta-button gate-submit" type="submit" :disabled="submitting">
        Enter
      </button>
    </form>
  </main>
</template>

<style scoped>
.gate {
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 24px 16px;
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, var(--brand-red-bg), transparent),
    var(--bg);
}

.gate-card {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 32px 28px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--bg-raised);
  box-shadow: var(--shadow);
}

.gate-logo {
  width: 56px;
  height: 56px;
  object-fit: contain;
  align-self: center;
}

.gate-card h1 {
  text-align: center;
  font-size: 22px;
  margin: 0;
}

.gate-sub {
  text-align: center;
  font-size: 14px;
  color: var(--text);
  margin: -4px 0 8px;
}

.gate-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-h);
}

.gate-field input {
  font: inherit;
  font-weight: 400;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-h);
}

.gate-field input:focus {
  outline: 2px solid var(--brand-red-border);
  outline-offset: 1px;
}

.gate-error {
  margin: 0;
  font-size: 13px;
  color: var(--danger);
  background: var(--danger-bg);
  padding: 8px 10px;
  border-radius: 8px;
}

.gate-submit {
  width: 100%;
  margin-top: 4px;
}
</style>
