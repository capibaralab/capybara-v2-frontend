<script setup>
import { reactive } from 'vue'
import { useCampaignDraftStore } from '../../stores/campaignDraft'

const draft = useCampaignDraftStore()
const errors = reactive({ fullName: '', instagramUrl: '' })

function looksLikeInstagramUrl(value) {
  return /^(https?:\/\/)?(www\.)?instagram\.com\/.+/i.test(value.trim())
}

function validate() {
  errors.fullName = draft.fullName.trim() ? '' : 'Full name is required'
  if (!draft.instagramUrl.trim()) {
    errors.instagramUrl = 'Instagram profile link is required'
  } else if (!looksLikeInstagramUrl(draft.instagramUrl)) {
    errors.instagramUrl = 'Enter a valid Instagram profile URL'
  } else {
    errors.instagramUrl = ''
  }
  return !errors.fullName && !errors.instagramUrl
}

defineExpose({ validate })
</script>

<template>
  <div>
    <div class="field">
      <label for="influencerFullName">Full Name</label>
      <input
        id="influencerFullName"
        v-model="draft.fullName"
        type="text"
        :class="{ 'has-error': errors.fullName }"
        placeholder="e.g. Jane Doe"
      />
      <span v-if="errors.fullName" class="error">{{ errors.fullName }}</span>
    </div>
    <div class="field">
      <label for="influencerInstagram">Instagram Profile Link</label>
      <input
        id="influencerInstagram"
        v-model="draft.instagramUrl"
        type="url"
        :class="{ 'has-error': errors.instagramUrl }"
        placeholder="https://instagram.com/yourhandle"
      />
      <span v-if="errors.instagramUrl" class="error">{{ errors.instagramUrl }}</span>
    </div>
  </div>
</template>
