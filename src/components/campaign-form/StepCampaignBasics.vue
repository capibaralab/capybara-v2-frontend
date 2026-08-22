<script setup>
import { reactive } from 'vue'
import { useCampaignDraftStore } from '../../stores/campaignDraft'

const draft = useCampaignDraftStore()
const errors = reactive({ campaignName: '', budget: '' })

function validate() {
  errors.campaignName = draft.campaignName.trim() ? '' : 'Campaign name is required'

  errors.budget = draft.budget !== '' && Number(draft.budget) > 0 ? '' : 'Enter a budget greater than $0'

  return !errors.campaignName && !errors.budget
}

defineExpose({ validate })
</script>

<template>
  <div>
    <div class="field">
      <label for="campaignName">Campaign Name</label>
      <input
        id="campaignName"
        v-model="draft.campaignName"
        type="text"
        :class="{ 'has-error': errors.campaignName }"
        placeholder="e.g. Summer Launch 2026"
      />
      <span v-if="errors.campaignName" class="error">{{ errors.campaignName }}</span>
    </div>
    <div class="field">
      <label for="budget">Budget</label>
      <div class="input-prefix-group">
        <span class="prefix">$</span>
        <input
          id="budget"
          v-model="draft.budget"
          type="number"
          min="1"
          step="1"
          :class="{ 'has-error': errors.budget }"
          placeholder="2500"
        />
      </div>
      <span v-if="errors.budget" class="error">{{ errors.budget }}</span>
    </div>
  </div>
</template>
