<script setup>
import { ref } from 'vue'
import { useCampaignDraftStore } from '../../stores/campaignDraft'

const draft = useCampaignDraftStore()
const error = ref('')

function select(type) {
  draft.accountType = type
  error.value = ''
}

function validate() {
  if (!draft.accountType) {
    error.value = 'Select an option to continue'
    return false
  }
  if (draft.accountType === 'influencer') {
    error.value = 'Influencer onboarding is coming soon — check back later!'
    return false
  }
  error.value = ''
  return true
}

defineExpose({ validate })
</script>

<template>
  <div>
    <h2>Influencer or Brand?</h2>
    <div class="option-grid">
      <button
        type="button"
        class="option-card"
        :class="{ selected: draft.accountType === 'brand' }"
        @click="select('brand')"
      >
        <strong>Brand</strong>
        <span>I want to run campaigns and find influencers</span>
      </button>
      <button
        type="button"
        class="option-card"
        :class="{ selected: draft.accountType === 'influencer' }"
        @click="select('influencer')"
      >
        <strong>Influencer</strong>
        <span>I want to collaborate with brands</span>
      </button>
    </div>
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>

<style scoped>
.option-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}
.option-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  padding: 16px 18px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
  cursor: pointer;
}
.option-card strong {
  font-size: 16px;
  color: var(--text-h);
}
.option-card span {
  font-size: 13px;
  color: var(--text);
}
.option-card.selected {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}
.option-card.selected strong {
  color: var(--accent);
}
</style>
