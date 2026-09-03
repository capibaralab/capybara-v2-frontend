<script setup>
import { ref } from 'vue'
import { useCampaignDraftStore } from '../../stores/campaignDraft'

const draft = useCampaignDraftStore()
const errors = ref(draft.preferredInfluencerUrls.map(() => ''))

function addUrl() {
  draft.preferredInfluencerUrls.push('')
  errors.value.push('')
}

function removeUrl(index) {
  draft.preferredInfluencerUrls.splice(index, 1)
  errors.value.splice(index, 1)
}

function validate() {
  const nextErrors = draft.preferredInfluencerUrls.map((url) => {
    const value = url.trim()
    if (!value) return ''
    const valid = /^(https?:\/\/)?(www\.)?instagram\.com\/.+/i.test(value)
    return valid ? '' : 'Enter a valid Instagram profile URL'
  })
  errors.value = nextErrors
  return nextErrors.every((error) => !error)
}

defineExpose({ validate })
</script>

<template>
  <div>
    <p class="hint">
      If you already have someone in mind, share their Instagram profile — our AI will evaluate
      them alongside its own recommendations.
    </p>
    <div class="field">
      <label>Instagram Profile URL{{ draft.preferredInfluencerUrls.length > 1 ? 's' : '' }}</label>
      <div class="link-list">
        <div v-for="(url, index) in draft.preferredInfluencerUrls" :key="index" class="link-row-wrap">
          <div class="link-row">
            <input
              v-model="draft.preferredInfluencerUrls[index]"
              type="url"
              :class="{ 'has-error': errors[index] }"
              placeholder="https://instagram.com/username"
            />
            <button
              v-if="draft.preferredInfluencerUrls.length > 1"
              type="button"
              class="remove-link-btn"
              aria-label="Remove link"
              @click="removeUrl(index)"
            >
              ×
            </button>
          </div>
          <span v-if="errors[index]" class="error">{{ errors[index] }}</span>
        </div>
      </div>
      <button type="button" class="add-link-btn" @click="addUrl">+ Add another profile</button>
    </div>
  </div>
</template>

<style scoped>
.link-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 8px;
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
  cursor: pointer;
}
.add-link-btn:hover {
  text-decoration: underline;
}
</style>
