<script setup>
import { ref } from 'vue'
import StepCompanyInfo from './StepCompanyInfo.vue'
import StepCategories from './StepCategories.vue'
import StepAudience from './StepAudience.vue'

const companyRef = ref(null)
const categoriesRef = ref(null)
const audienceRef = ref(null)

function validate() {
  const companyValid = companyRef.value?.validate() ?? true
  const categoriesValid = categoriesRef.value?.validate() ?? true
  const audienceValid = audienceRef.value?.validate() ?? true
  return companyValid && categoriesValid && audienceValid
}

defineExpose({ validate })
</script>

<template>
  <div>
    <StepCompanyInfo ref="companyRef" />
    <hr class="divider" />
    <StepCategories ref="categoriesRef" />
    <hr class="divider" />
    <StepAudience ref="audienceRef" />
  </div>
</template>

<style scoped>
.divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 28px 0;
}
</style>
