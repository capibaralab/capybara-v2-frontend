<script setup>
import { reactive, ref } from 'vue'
import { useCampaignDraftStore } from '../../stores/campaignDraft'
import { SEGMENT_OPTIONS, GENDER_OPTIONS } from '../../services/constants'
import { suggestAudienceIntent } from '../../services/api'
import ChipMultiSelect from '../ChipMultiSelect.vue'
import AiSuggestIconButton from '../AiSuggestIconButton.vue'

const draft = useCampaignDraftStore()
const errors = reactive({ targetSegments: '', targetGender: '' })
const suggestingIntent = ref(false)

async function aiSuggestIntent() {
  suggestingIntent.value = true
  try {
    draft.audienceIntent = await suggestAudienceIntent({ categories: draft.categories })
  } finally {
    suggestingIntent.value = false
  }
}

function validate() {
  errors.targetSegments = draft.targetSegments.length ? '' : 'Select at least one age segment'
  errors.targetGender = draft.targetGender.length ? '' : 'Select at least one option'
  return !errors.targetSegments && !errors.targetGender
}

defineExpose({ validate })
</script>

<template>
  <div>
    <h2>Target Audience</h2>
    <div class="field">
      <label>Segment</label>
      <ChipMultiSelect v-model="draft.targetSegments" :options="SEGMENT_OPTIONS" exclusive-value="all" />
      <span v-if="errors.targetSegments" class="error">{{ errors.targetSegments }}</span>
    </div>
    <div class="field">
      <label>Gender</label>
      <ChipMultiSelect v-model="draft.targetGender" :options="GENDER_OPTIONS" />
      <span v-if="errors.targetGender" class="error">{{ errors.targetGender }}</span>
    </div>
    <div class="field">
      <div class="section-title-row">
        <label for="audienceIntent">Intent</label>
        <AiSuggestIconButton
          :loading="suggestingIntent"
          label="Suggest audience intent with AI"
          @click="aiSuggestIntent"
        />
      </div>
      <input
        id="audienceIntent"
        v-model="draft.audienceIntent"
        type="text"
        placeholder="e.g. Young parents, Fitness enthusiasts, Luxury travelers"
      />
    </div>
  </div>
</template>

<style scoped>
.section-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.section-title-row label {
  margin: 0;
}
</style>
