<script setup>
import { reactive } from 'vue'
import { useCampaignDraftStore } from '../../stores/campaignDraft'

const draft = useCampaignDraftStore()
const errors = reactive({ preferredInfluencerUrl: '' })

function validate() {
  const value = draft.preferredInfluencerUrl.trim()
  if (!value) {
    errors.preferredInfluencerUrl = ''
    return true
  }
  const valid = /^(https?:\/\/)?(www\.)?instagram\.com\/.+/i.test(value)
  errors.preferredInfluencerUrl = valid ? '' : 'Enter a valid Instagram profile URL'
  return valid
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
      <label for="preferredInfluencerUrl">Instagram Profile URL</label>
      <input
        id="preferredInfluencerUrl"
        v-model="draft.preferredInfluencerUrl"
        type="url"
        :class="{ 'has-error': errors.preferredInfluencerUrl }"
        placeholder="https://instagram.com/username"
      />
      <span v-if="errors.preferredInfluencerUrl" class="error">{{ errors.preferredInfluencerUrl }}</span>
    </div>
  </div>
</template>
