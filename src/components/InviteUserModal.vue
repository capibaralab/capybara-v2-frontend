<script setup>
import { ref } from 'vue'
import { useAdvertiserProfileStore } from '../stores/advertiserProfile'

const emit = defineEmits(['close'])

const profile = useAdvertiserProfileStore()
const email = ref('')
const error = ref('')
const submitting = ref(false)
const sent = ref(false)

function companyDomain() {
  return profile.companyWebsite
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .toLowerCase()
}

function attemptClose() {
  emit('close')
}

async function sendInvite() {
  const trimmed = email.value.trim()
  if (!trimmed) {
    error.value = 'Email is required'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    error.value = 'Enter a valid email address'
    return
  }
  const domain = trimmed.split('@')[1].toLowerCase()
  const expected = companyDomain()
  if (expected && domain !== expected) {
    error.value = `Email must be from your company domain (@${expected})`
    return
  }
  error.value = ''
  submitting.value = true
  await new Promise((resolve) => setTimeout(resolve, 500))
  submitting.value = false
  sent.value = true
}
</script>

<template>
  <div class="modal-backdrop" @click.self="attemptClose">
    <div class="modal-dialog card form-theme-red" role="dialog" aria-modal="true" aria-labelledby="invite-user-modal-title">
      <div class="modal-header">
        <h2 id="invite-user-modal-title">Invite a User</h2>
        <button type="button" class="modal-close" aria-label="Close" @click="attemptClose">×</button>
      </div>

      <template v-if="!sent">
        <p class="modal-subtitle">
          Invite a teammate from your company to join this account. They must use an email
          address on your company's domain.
        </p>

        <div class="field">
          <label for="inviteEmail">Email</label>
          <input
            id="inviteEmail"
            v-model="email"
            type="text"
            inputmode="email"
            :class="{ 'has-error': error }"
            placeholder="e.g. teammate@yourcompany.com"
          />
          <span v-if="error" class="error">{{ error }}</span>
        </div>

        <div class="step-actions">
          <button type="button" class="btn btn-secondary" :disabled="submitting" @click="attemptClose">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" :disabled="submitting" @click="sendInvite">
            {{ submitting ? 'Sending…' : 'Invite' }}
          </button>
        </div>
      </template>

      <template v-else>
        <p class="invite-done-text">Invite sent to {{ email }}!</p>
        <div class="step-actions">
          <span></span>
          <button type="button" class="btn btn-primary" @click="attemptClose">Done</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 100;
}
.modal-dialog {
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  text-align: left;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.modal-header h2 {
  margin: 0;
}
.modal-close {
  background: none;
  border: none;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  color: var(--text);
  padding: 0 4px;
}
.modal-close:hover {
  color: var(--text-h);
}
.modal-subtitle {
  color: var(--text);
  font-size: 14px;
  margin: 0 0 20px;
}
.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}
.invite-done-text {
  text-align: center;
  color: var(--text-h);
  margin: 8px 0 8px;
}

/*
 * --accent / --accent-bg / --accent-border are shared design tokens (defined in style.css
 * and used app-wide). Re-declared here so only this modal inherits the brand red, matching
 * the same pattern used by InviteInfluencersModal.vue.
 */
.form-theme-red {
  --accent: var(--brand-red);
  --accent-bg: var(--brand-red-bg);
  --accent-border: var(--brand-red-border);
}
.modal-dialog :deep(.btn-primary) {
  background: var(--brand-red);
}
</style>
