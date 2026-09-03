<script setup>
import { ref } from 'vue'
import logo from '../assets/logo.png'

const emit = defineEmits(['close'])

const links = ref([''])
const error = ref('')
const submitting = ref(false)
const sent = ref(false)

function addLink() {
  links.value.push('')
}

function removeLink(index) {
  links.value.splice(index, 1)
}

function attemptClose() {
  emit('close')
}

async function sendInvites() {
  const filled = links.value.map((link) => link.trim()).filter(Boolean)
  if (!filled.length) {
    error.value = 'Add at least one Instagram profile link'
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
    <div class="modal-dialog card form-theme-red" role="dialog" aria-modal="true" aria-labelledby="invite-modal-title">
      <img :src="logo" alt="" class="modal-logo" />

      <div class="modal-header">
        <h2 id="invite-modal-title">Invite Influencers</h2>
        <button type="button" class="modal-close" aria-label="Close" @click="attemptClose">×</button>
      </div>

      <template v-if="!sent">
        <p class="modal-subtitle">
          Invite Influencers to join the Capybara family and get paid to integrate products into
          their native content
        </p>

        <div class="link-list">
          <div v-for="(link, index) in links" :key="index" class="link-row">
            <input v-model="links[index]" type="url" placeholder="https://instagram.com/username" />
            <button
              v-if="links.length > 1"
              type="button"
              class="remove-link-btn"
              aria-label="Remove link"
              @click="removeLink(index)"
            >
              ×
            </button>
          </div>
        </div>
        <button type="button" class="add-link-btn" @click="addLink">+ Add another link</button>

        <span v-if="error" class="error">{{ error }}</span>

        <div class="step-actions">
          <button type="button" class="btn btn-secondary" :disabled="submitting" @click="attemptClose">
            Cancel
          </button>
          <button type="button" class="btn btn-primary btn-create" :disabled="submitting" @click="sendInvites">
            {{ submitting ? 'Sending…' : 'Invite' }}
          </button>
        </div>
      </template>

      <template v-else>
        <p class="invite-done-text">Invites sent! We'll let you know once they respond.</p>
        <div class="step-actions">
          <span></span>
          <button type="button" class="btn btn-primary btn-create" @click="attemptClose">Done</button>
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
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.modal-dialog::-webkit-scrollbar {
  display: none;
}
.modal-logo {
  display: block;
  width: 48px;
  height: 48px;
  object-fit: contain;
  margin: 0 auto 12px;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.modal-header h2 {
  margin: 0;
  width: 100%;
  text-align: center;
}
.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
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
.modal-dialog {
  position: relative;
}
.modal-subtitle {
  color: var(--text);
  font-size: 14px;
  text-align: center;
  margin: 0 0 24px;
}
.link-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}
.link-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.link-row input {
  flex: 1;
}
.remove-link-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: none;
  color: var(--text);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}
.remove-link-btn:hover {
  color: var(--danger);
  border-color: var(--danger);
}
.add-link-btn {
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--brand-red);
  background: none;
  border: none;
  padding: 0;
  margin-bottom: 20px;
  cursor: pointer;
}
.add-link-btn:hover {
  text-decoration: underline;
}
.error {
  display: block;
  color: var(--danger);
  font-size: 13px;
  margin-bottom: 12px;
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
 * and used app-wide). Rather than change them globally, this re-declares the tokens on the
 * modal so only elements inside it inherit the brand red. Sourced from the central
 * --brand-red-* tokens (style.css), which already flip for dark mode.
 */
.form-theme-red {
  --accent: var(--brand-red);
  --accent-bg: var(--brand-red-bg);
  --accent-border: var(--brand-red-border);
}
</style>
