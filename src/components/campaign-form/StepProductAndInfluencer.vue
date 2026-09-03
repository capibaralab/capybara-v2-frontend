<script setup>
import { ref } from 'vue'
import StepCampaignBasics from './StepCampaignBasics.vue'
import StepProduct from './StepProduct.vue'
import StepPreferredInfluencer from './StepPreferredInfluencer.vue'

defineProps({
  expandPreferredInfluencer: { type: Boolean, default: false },
})

const basicsRef = ref(null)
const productRef = ref(null)
const preferredRef = ref(null)

function validate() {
  const basicsValid = basicsRef.value?.validate() ?? true
  const productValid = productRef.value?.validate() ?? true
  const preferredValid = preferredRef.value?.validate() ?? true
  return basicsValid && productValid && preferredValid
}

defineExpose({ validate })
</script>

<template>
  <div>
    <StepCampaignBasics ref="basicsRef" />
    <hr class="divider" />
    <StepProduct ref="productRef" />
    <details class="optional-panel" :open="expandPreferredInfluencer">
      <summary>Preferred Influencer (optional)</summary>
      <div class="optional-panel-body">
        <StepPreferredInfluencer ref="preferredRef" />
      </div>
    </details>
  </div>
</template>

<style scoped>
.divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 28px 0;
}
.optional-panel {
  margin-top: 24px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0 16px;
}
.optional-panel summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--text-h);
  padding: 14px 0;
  list-style: none;
}
.optional-panel summary::-webkit-details-marker {
  display: none;
}
.optional-panel summary::before {
  content: '▸ ';
  color: var(--accent);
}
.optional-panel[open] summary::before {
  content: '▾ ';
}
.optional-panel-body {
  padding-bottom: 16px;
}
</style>
