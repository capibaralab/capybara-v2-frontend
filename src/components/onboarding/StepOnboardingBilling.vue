<script setup>
import { reactive } from 'vue'
import { useCampaignDraftStore } from '../../stores/campaignDraft'

const draft = useCampaignDraftStore()
const errors = reactive({ cardNumber: '', expiry: '', cvc: '' })

function validate() {
  const digits = draft.cardNumber.replace(/\s+/g, '')
  errors.cardNumber = /^\d{13,19}$/.test(digits) ? '' : 'Enter a valid card number'
  errors.expiry = /^(0[1-9]|1[0-2])\/\d{2}$/.test(draft.expiry.trim()) ? '' : 'Use MM/YY format'
  errors.cvc = /^\d{3,4}$/.test(draft.cvc.trim()) ? '' : 'Enter a valid CVC'
  return !errors.cardNumber && !errors.expiry && !errors.cvc
}

defineExpose({ validate })
</script>

<template>
  <div>
    <h2>Billing</h2>
    <div class="free-banner">Your first campaign is free!</div>
    <div class="field">
      <label for="billingCardNumber">Card Number</label>
      <input
        id="billingCardNumber"
        v-model="draft.cardNumber"
        type="text"
        inputmode="numeric"
        :class="{ 'has-error': errors.cardNumber }"
        placeholder="4242 4242 4242 4242"
      />
      <span v-if="errors.cardNumber" class="error">{{ errors.cardNumber }}</span>
    </div>
    <div class="billing-row">
      <div class="field">
        <label for="billingExpiry">Expiry</label>
        <input
          id="billingExpiry"
          v-model="draft.expiry"
          type="text"
          :class="{ 'has-error': errors.expiry }"
          placeholder="MM/YY"
        />
        <span v-if="errors.expiry" class="error">{{ errors.expiry }}</span>
      </div>
      <div class="field">
        <label for="billingCvc">CVC</label>
        <input
          id="billingCvc"
          v-model="draft.cvc"
          type="text"
          inputmode="numeric"
          :class="{ 'has-error': errors.cvc }"
          placeholder="123"
        />
        <span v-if="errors.cvc" class="error">{{ errors.cvc }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.free-banner {
  background: var(--brand-blue-bg);
  color: var(--brand-blue);
  font-weight: 700;
  text-align: center;
  padding: 16px;
  border-radius: 10px;
  font-size: 15px;
  margin-bottom: 20px;
}
.billing-row {
  display: flex;
  gap: 16px;
}
.billing-row .field {
  flex: 1;
}
</style>
