<script setup>
import { reactive } from 'vue'
import { useCampaignDraftStore } from '../../stores/campaignDraft'

const draft = useCampaignDraftStore()
const errors = reactive({ username: '', email: '', password: '' })

function validate() {
  errors.username = draft.username.trim() ? '' : 'Username is required'
  if (!draft.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
    errors.email = 'Enter a valid email address'
  } else {
    errors.email = ''
  }
  errors.password = draft.password.trim() ? '' : 'Password is required'
  return !errors.username && !errors.email && !errors.password
}

defineExpose({ validate })
</script>

<template>
  <div>
    <div class="field">
      <label for="onboardUsername">Username</label>
      <input
        id="onboardUsername"
        v-model="draft.username"
        type="text"
        :class="{ 'has-error': errors.username }"
        placeholder="e.g. jane.doe"
      />
      <span v-if="errors.username" class="error">{{ errors.username }}</span>
    </div>
    <div class="field">
      <label for="onboardEmail">Email</label>
      <input
        id="onboardEmail"
        v-model="draft.email"
        type="text"
        :class="{ 'has-error': errors.email }"
        placeholder="e.g. jane.doe@yourcompany.com"
      />
      <span v-if="errors.email" class="error">{{ errors.email }}</span>
    </div>
    <div class="field">
      <label for="onboardPassword">Password</label>
      <input
        id="onboardPassword"
        v-model="draft.password"
        type="password"
        :class="{ 'has-error': errors.password }"
        placeholder="••••••••"
      />
      <span v-if="errors.password" class="error">{{ errors.password }}</span>
    </div>
  </div>
</template>
