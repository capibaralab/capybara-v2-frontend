<script setup>
import { reactive } from 'vue'
import { useCampaignDraftStore } from '../../stores/campaignDraft'

const draft = useCampaignDraftStore()
const errors = reactive({ companyName: '', companyWebsite: '' })

function looksLikeUrl(value) {
  return /^(https?:\/\/)?[\w-]+(\.[\w-]+)+.*$/i.test(value.trim())
}

function validate() {
  errors.companyName = draft.companyName.trim() ? '' : 'Company name is required'
  if (!draft.companyWebsite.trim()) {
    errors.companyWebsite = 'Company website is required'
  } else if (!looksLikeUrl(draft.companyWebsite)) {
    errors.companyWebsite = 'Enter a valid website URL'
  } else {
    errors.companyWebsite = ''
  }
  return !errors.companyName && !errors.companyWebsite
}

defineExpose({ validate })
</script>

<template>
  <div>
    <div class="field">
      <label for="companyName">Name</label>
      <input
        id="companyName"
        v-model="draft.companyName"
        type="text"
        :class="{ 'has-error': errors.companyName }"
        placeholder="e.g. Capybara Skincare Co."
      />
      <span v-if="errors.companyName" class="error">{{ errors.companyName }}</span>
    </div>
    <div class="field">
      <label for="companyWebsite">Website</label>
      <input
        id="companyWebsite"
        v-model="draft.companyWebsite"
        type="url"
        :class="{ 'has-error': errors.companyWebsite }"
        placeholder="https://example.com"
      />
      <span v-if="errors.companyWebsite" class="error">{{ errors.companyWebsite }}</span>
    </div>
  </div>
</template>
