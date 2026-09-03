<script setup>
import { computed, reactive } from 'vue'
import { useCampaignDraftStore } from '../../stores/campaignDraft'
import { getBankFieldSet } from '../../services/countries'
import CountrySelect from '../CountrySelect.vue'

const draft = useCampaignDraftStore()
const errors = reactive({
  bankAccountHolder: '',
  bankName: '',
  bankCountry: '',
  bankAccountNumber: '',
  bankRoutingNumber: '',
  bankIlBankNumber: '',
  bankIlBranchNumber: '',
  bankIban: '',
  bankSwiftCode: '',
})

const fieldSet = computed(() => getBankFieldSet(draft.bankCountry))

function validate() {
  errors.bankAccountHolder = draft.bankAccountHolder.trim() ? '' : 'Account holder name is required'
  errors.bankName = draft.bankName.trim() ? '' : 'Bank name is required'
  errors.bankCountry = draft.bankCountry ? '' : 'Select a country'

  errors.bankAccountNumber = ''
  errors.bankRoutingNumber = ''
  errors.bankIlBankNumber = ''
  errors.bankIlBranchNumber = ''
  errors.bankIban = ''
  errors.bankSwiftCode = ''

  if (fieldSet.value === 'us') {
    const account = draft.bankAccountNumber.replace(/\s+/g, '')
    errors.bankAccountNumber = /^\d{4,17}$/.test(account) ? '' : 'Enter a valid account number'
    const routing = draft.bankRoutingNumber.replace(/\s+/g, '')
    errors.bankRoutingNumber = /^\d{9}$/.test(routing) ? '' : 'Enter a valid 9-digit routing number'
  } else if (fieldSet.value === 'il') {
    const bankNumber = draft.bankIlBankNumber.trim()
    errors.bankIlBankNumber = /^\d{2,3}$/.test(bankNumber) ? '' : 'Enter a valid bank number'
    const branchNumber = draft.bankIlBranchNumber.trim()
    errors.bankIlBranchNumber = /^\d{3,4}$/.test(branchNumber) ? '' : 'Enter a valid branch number'
    const account = draft.bankAccountNumber.replace(/\s+/g, '')
    errors.bankAccountNumber = /^\d{4,15}$/.test(account) ? '' : 'Enter a valid account number'
  } else if (fieldSet.value === 'iban') {
    const iban = draft.bankIban.replace(/\s+/g, '').toUpperCase()
    errors.bankIban = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban) ? '' : 'Enter a valid IBAN'
    const swift = draft.bankSwiftCode.replace(/\s+/g, '').toUpperCase()
    errors.bankSwiftCode = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swift) ? '' : 'Enter a valid SWIFT/BIC code'
  } else {
    const account = draft.bankAccountNumber.replace(/\s+/g, '')
    errors.bankAccountNumber = /^[A-Z0-9]{4,34}$/i.test(account) ? '' : 'Enter a valid account number'
    const swift = draft.bankSwiftCode.replace(/\s+/g, '').toUpperCase()
    errors.bankSwiftCode = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swift) ? '' : 'Enter a valid SWIFT/BIC code'
  }

  return Object.values(errors).every((error) => !error)
}

defineExpose({ validate })
</script>

<template>
  <div>
    <h2>Payments</h2>
    <p class="hint">
      Add your bank account so we know where to send your profits once a collaboration pays out.
    </p>
    <div class="field">
      <label for="bankAccountHolder">Account Holder Name</label>
      <input
        id="bankAccountHolder"
        v-model="draft.bankAccountHolder"
        type="text"
        :class="{ 'has-error': errors.bankAccountHolder }"
        placeholder="e.g. Jane Doe"
      />
      <span v-if="errors.bankAccountHolder" class="error">{{ errors.bankAccountHolder }}</span>
    </div>
    <div class="field">
      <label for="bankCountry">Country</label>
      <CountrySelect id="bankCountry" v-model="draft.bankCountry" />
      <span v-if="errors.bankCountry" class="error">{{ errors.bankCountry }}</span>
    </div>
    <div class="field">
      <label for="bankName">Bank Name</label>
      <input
        id="bankName"
        v-model="draft.bankName"
        type="text"
        :class="{ 'has-error': errors.bankName }"
        placeholder="e.g. Chase"
      />
      <span v-if="errors.bankName" class="error">{{ errors.bankName }}</span>
    </div>

    <template v-if="fieldSet === 'us'">
      <div class="payments-row">
        <div class="field">
          <label for="bankAccountNumber">Account Number</label>
          <input
            id="bankAccountNumber"
            v-model="draft.bankAccountNumber"
            type="text"
            inputmode="numeric"
            :class="{ 'has-error': errors.bankAccountNumber }"
            placeholder="000123456789"
          />
          <span v-if="errors.bankAccountNumber" class="error">{{ errors.bankAccountNumber }}</span>
        </div>
        <div class="field">
          <label for="bankRoutingNumber">Routing Number</label>
          <input
            id="bankRoutingNumber"
            v-model="draft.bankRoutingNumber"
            type="text"
            inputmode="numeric"
            :class="{ 'has-error': errors.bankRoutingNumber }"
            placeholder="021000021"
          />
          <span v-if="errors.bankRoutingNumber" class="error">{{ errors.bankRoutingNumber }}</span>
        </div>
      </div>
    </template>

    <template v-else-if="fieldSet === 'il'">
      <div class="payments-row">
        <div class="field">
          <label for="bankIlBankNumber">Bank Number</label>
          <input
            id="bankIlBankNumber"
            v-model="draft.bankIlBankNumber"
            type="text"
            inputmode="numeric"
            :class="{ 'has-error': errors.bankIlBankNumber }"
            placeholder="e.g. 12"
          />
          <span v-if="errors.bankIlBankNumber" class="error">{{ errors.bankIlBankNumber }}</span>
        </div>
        <div class="field">
          <label for="bankIlBranchNumber">Branch Number</label>
          <input
            id="bankIlBranchNumber"
            v-model="draft.bankIlBranchNumber"
            type="text"
            inputmode="numeric"
            :class="{ 'has-error': errors.bankIlBranchNumber }"
            placeholder="e.g. 619"
          />
          <span v-if="errors.bankIlBranchNumber" class="error">{{ errors.bankIlBranchNumber }}</span>
        </div>
      </div>
      <div class="field">
        <label for="bankAccountNumber">Account Number</label>
        <input
          id="bankAccountNumber"
          v-model="draft.bankAccountNumber"
          type="text"
          inputmode="numeric"
          :class="{ 'has-error': errors.bankAccountNumber }"
          placeholder="e.g. 123456"
        />
        <span v-if="errors.bankAccountNumber" class="error">{{ errors.bankAccountNumber }}</span>
      </div>
    </template>

    <template v-else-if="fieldSet === 'iban'">
      <div class="field">
        <label for="bankIban">IBAN</label>
        <input
          id="bankIban"
          v-model="draft.bankIban"
          type="text"
          :class="{ 'has-error': errors.bankIban }"
          placeholder="e.g. DE89 3704 0044 0532 0130 00"
        />
        <span v-if="errors.bankIban" class="error">{{ errors.bankIban }}</span>
      </div>
      <div class="field">
        <label for="bankSwiftCode">SWIFT / BIC Code</label>
        <input
          id="bankSwiftCode"
          v-model="draft.bankSwiftCode"
          type="text"
          :class="{ 'has-error': errors.bankSwiftCode }"
          placeholder="e.g. DEUTDEFF"
        />
        <span v-if="errors.bankSwiftCode" class="error">{{ errors.bankSwiftCode }}</span>
      </div>
    </template>

    <template v-else>
      <div class="field">
        <label for="bankAccountNumber">Account Number</label>
        <input
          id="bankAccountNumber"
          v-model="draft.bankAccountNumber"
          type="text"
          :class="{ 'has-error': errors.bankAccountNumber }"
          placeholder="Account number"
        />
        <span v-if="errors.bankAccountNumber" class="error">{{ errors.bankAccountNumber }}</span>
      </div>
      <div class="field">
        <label for="bankSwiftCode">SWIFT / BIC Code</label>
        <input
          id="bankSwiftCode"
          v-model="draft.bankSwiftCode"
          type="text"
          :class="{ 'has-error': errors.bankSwiftCode }"
          placeholder="e.g. DEUTDEFF"
        />
        <span v-if="errors.bankSwiftCode" class="error">{{ errors.bankSwiftCode }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.hint {
  color: var(--text);
  margin: 0 0 20px;
}
.payments-row {
  display: flex;
  gap: 16px;
}
.payments-row .field {
  flex: 1;
}
</style>
