<script setup>
import { reactive, ref } from 'vue'
import { useCampaignDraftStore } from '../../stores/campaignDraft'
import { CATEGORY_OPTIONS } from '../../services/constants'
import { suggestCategories } from '../../services/api'
import ChipMultiSelect from '../ChipMultiSelect.vue'
import AiSuggestIconButton from '../AiSuggestIconButton.vue'

const draft = useCampaignDraftStore()
const options = CATEGORY_OPTIONS.map((category) => ({ value: category, label: category }))
const errors = reactive({ categories: '' })
const suggesting = ref(false)

async function aiSuggest() {
  suggesting.value = true
  try {
    const suggestions = await suggestCategories({
      companyName: draft.companyName,
      companyWebsite: draft.companyWebsite,
    })
    const merged = new Set([...draft.categories, ...suggestions])
    draft.categories = [...merged]
  } finally {
    suggesting.value = false
  }
}

function validate() {
  errors.categories = draft.categories.length ? '' : 'Select at least one category (or use AI Suggest)'
  return !errors.categories
}

defineExpose({ validate })
</script>

<template>
  <div>
    <div class="section-title-row">
      <h2>Categories</h2>
      <AiSuggestIconButton
        :loading="suggesting"
        label="Suggest company categories with AI"
        @click="aiSuggest"
      />
    </div>
    <div class="field">
      <ChipMultiSelect v-model="draft.categories" :options="options" />
      <span v-if="errors.categories" class="error">{{ errors.categories }}</span>
    </div>
  </div>
</template>

<style scoped>
.section-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.section-title-row h2 {
  margin: 0;
}
</style>
