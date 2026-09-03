<script setup>
import { reactive, ref } from 'vue'
import { useCampaignDraftStore } from '../../stores/campaignDraft'
import { SEGMENT_OPTIONS, GENDER_OPTIONS } from '../../services/constants'
import { analyzeInfluencerAudience } from '../../services/api'
import ChipMultiSelect from '../ChipMultiSelect.vue'

const draft = useCampaignDraftStore()
const errors = reactive({ targetSegments: '', targetGender: '', analysis: '' })
const analyzing = ref(false)
const findings = ref(null)

async function analyze() {
  analyzing.value = true
  try {
    findings.value = await analyzeInfluencerAudience({
      targetSegments: draft.targetSegments,
      targetGender: draft.targetGender,
    })
    draft.audienceFindings = findings.value
    errors.analysis = ''
  } finally {
    analyzing.value = false
  }
}

function validate() {
  errors.targetSegments = draft.targetSegments.length ? '' : 'Select at least one age segment'
  errors.targetGender = draft.targetGender.length ? '' : 'Select at least one option'
  errors.analysis = findings.value ? '' : 'Analyze your audience to continue'
  return !errors.targetSegments && !errors.targetGender && !errors.analysis
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
      <button type="button" class="btn btn-primary analyze-btn" :disabled="analyzing" @click="analyze">
        {{ analyzing ? 'Analyzing…' : 'Analyze my audience' }}
      </button>
      <span v-if="errors.analysis" class="error">{{ errors.analysis }}</span>

      <div v-if="findings" class="findings card">
        <strong>AI Findings</strong>
        <ul>
          <li v-for="(line, i) in findings" :key="i">{{ line }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analyze-btn {
  width: 100%;
}
.findings {
  margin-top: 16px;
  background: var(--accent-bg);
  border-color: var(--accent-border);
}
.findings strong {
  display: block;
  margin-bottom: 8px;
  color: var(--text-h);
  font-size: 14px;
}
.findings ul {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.findings li {
  font-size: 14px;
  color: var(--text-h);
}
</style>
