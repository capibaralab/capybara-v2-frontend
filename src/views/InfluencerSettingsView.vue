<script setup>
import { computed, reactive, ref } from 'vue'
import { useInfluencerProfileStore } from '../stores/influencerProfile'
import { SEGMENT_OPTIONS, GENDER_OPTIONS } from '../services/constants'
import { COUNTRIES, getBankFieldSet } from '../services/countries'
import ChipMultiSelect from '../components/ChipMultiSelect.vue'
import CountrySelect from '../components/CountrySelect.vue'

const profile = useInfluencerProfileStore()

const segmentLabels = computed(() => {
  const byValue = Object.fromEntries(SEGMENT_OPTIONS.map((opt) => [opt.value, opt.label]))
  return profile.targetSegments.map((value) => byValue[value] ?? value).join(', ')
})

const genderLabels = computed(() => {
  const byValue = Object.fromEntries(GENDER_OPTIONS.map((opt) => [opt.value, opt.label]))
  return profile.targetGender.map((value) => byValue[value] ?? value).join(', ')
})

const countryName = computed(() => COUNTRIES.find((c) => c.code === profile.bankCountry)?.name ?? '—')
const bankFieldSet = computed(() => getBankFieldSet(profile.bankCountry))

const editingSection = ref(null)

const form = reactive({
  targetSegments: [],
  targetGender: [],
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

const errors = reactive({
  targetSegments: '',
  targetGender: '',
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

const formFieldSet = computed(() => getBankFieldSet(form.bankCountry))

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

function startEdit(section) {
  clearErrors()
  if (section === 'audience') {
    form.targetSegments = [...profile.targetSegments]
    form.targetGender = [...profile.targetGender]
  } else if (section === 'payments') {
    form.bankAccountHolder = profile.bankAccountHolder
    form.bankName = profile.bankName
    form.bankCountry = profile.bankCountry
    form.bankAccountNumber = profile.bankAccountNumber
    form.bankRoutingNumber = profile.bankRoutingNumber
    form.bankIlBankNumber = profile.bankIlBankNumber
    form.bankIlBranchNumber = profile.bankIlBranchNumber
    form.bankIban = profile.bankIban
    form.bankSwiftCode = profile.bankSwiftCode
  }
  editingSection.value = section
}

function cancelEdit() {
  editingSection.value = null
}

function saveAudience() {
  errors.targetSegments = form.targetSegments.length ? '' : 'Select at least one age segment'
  errors.targetGender = form.targetGender.length ? '' : 'Select at least one option'
  if (errors.targetSegments || errors.targetGender) return
  profile.targetSegments = [...form.targetSegments]
  profile.targetGender = [...form.targetGender]
  editingSection.value = null
}

function savePayments() {
  errors.bankAccountHolder = form.bankAccountHolder.trim() ? '' : 'Account holder name is required'
  errors.bankName = form.bankName.trim() ? '' : 'Bank name is required'
  errors.bankCountry = form.bankCountry ? '' : 'Select a country'
  errors.bankAccountNumber = ''
  errors.bankRoutingNumber = ''
  errors.bankIlBankNumber = ''
  errors.bankIlBranchNumber = ''
  errors.bankIban = ''
  errors.bankSwiftCode = ''

  if (formFieldSet.value === 'us') {
    const account = form.bankAccountNumber.replace(/\s+/g, '')
    errors.bankAccountNumber = /^\d{4,17}$/.test(account) ? '' : 'Enter a valid account number'
    const routing = form.bankRoutingNumber.replace(/\s+/g, '')
    errors.bankRoutingNumber = /^\d{9}$/.test(routing) ? '' : 'Enter a valid 9-digit routing number'
  } else if (formFieldSet.value === 'il') {
    errors.bankIlBankNumber = /^\d{2,3}$/.test(form.bankIlBankNumber.trim()) ? '' : 'Enter a valid bank number'
    errors.bankIlBranchNumber = /^\d{3,4}$/.test(form.bankIlBranchNumber.trim()) ? '' : 'Enter a valid branch number'
    const account = form.bankAccountNumber.replace(/\s+/g, '')
    errors.bankAccountNumber = /^\d{4,15}$/.test(account) ? '' : 'Enter a valid account number'
  } else if (formFieldSet.value === 'iban') {
    const iban = form.bankIban.replace(/\s+/g, '').toUpperCase()
    errors.bankIban = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban) ? '' : 'Enter a valid IBAN'
    const swift = form.bankSwiftCode.replace(/\s+/g, '').toUpperCase()
    errors.bankSwiftCode = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swift) ? '' : 'Enter a valid SWIFT/BIC code'
  } else {
    const account = form.bankAccountNumber.replace(/\s+/g, '')
    errors.bankAccountNumber = /^[A-Z0-9]{4,34}$/i.test(account) ? '' : 'Enter a valid account number'
    const swift = form.bankSwiftCode.replace(/\s+/g, '').toUpperCase()
    errors.bankSwiftCode = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swift) ? '' : 'Enter a valid SWIFT/BIC code'
  }

  if (Object.values(errors).some(Boolean)) return

  profile.bankAccountHolder = form.bankAccountHolder
  profile.bankName = form.bankName
  profile.bankCountry = form.bankCountry
  profile.bankAccountNumber = form.bankAccountNumber
  profile.bankRoutingNumber = form.bankRoutingNumber
  profile.bankIlBankNumber = form.bankIlBankNumber
  profile.bankIlBranchNumber = form.bankIlBranchNumber
  profile.bankIban = form.bankIban
  profile.bankSwiftCode = form.bankSwiftCode
  editingSection.value = null
}
</script>

<template>
  <main class="container page">
    <RouterLink to="/influencer" class="back-link">← Back to Home</RouterLink>

    <h1>Settings</h1>
    <p class="hint">Your account and audience profile, as set up during onboarding.</p>

    <p v-if="!profile.onboarded" class="empty card">
      You haven't completed onboarding yet — this page will fill in once you do.
    </p>

    <template v-else>
      <section class="card section">
        <div class="section-header">
          <h2>Account</h2>
        </div>
        <div class="field-row">
          <span class="field-label">Username</span>
          <span class="field-value">{{ profile.username }}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Email</span>
          <span class="field-value">{{ profile.email }}</span>
        </div>
      </section>

      <section class="card section">
        <div class="section-header">
          <h2>Your Info</h2>
        </div>
        <div class="field-row">
          <span class="field-label">Full Name</span>
          <span class="field-value">{{ profile.fullName }}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Instagram</span>
          <span class="field-value">{{ profile.instagramUrl }}</span>
        </div>
      </section>

      <section class="card section">
        <div class="section-header">
          <h2>Target Audience</h2>
          <button
            v-if="editingSection !== 'audience'"
            type="button"
            class="edit-btn"
            aria-label="Edit target audience"
            @click="startEdit('audience')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </button>
        </div>

        <template v-if="editingSection === 'audience'">
          <div class="field">
            <label>Segment</label>
            <ChipMultiSelect v-model="form.targetSegments" :options="SEGMENT_OPTIONS" exclusive-value="all" />
            <span v-if="errors.targetSegments" class="error">{{ errors.targetSegments }}</span>
          </div>
          <div class="field">
            <label>Gender</label>
            <ChipMultiSelect v-model="form.targetGender" :options="GENDER_OPTIONS" />
            <span v-if="errors.targetGender" class="error">{{ errors.targetGender }}</span>
          </div>
          <div class="edit-actions">
            <button type="button" class="btn btn-secondary" @click="cancelEdit">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveAudience">Save</button>
          </div>
        </template>
        <template v-else>
          <div class="field-row">
            <span class="field-label">Segment</span>
            <span class="field-value">{{ segmentLabels || '—' }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Gender</span>
            <span class="field-value">{{ genderLabels || '—' }}</span>
          </div>
          <div v-if="profile.audienceFindings.length" class="findings">
            <strong>AI Findings</strong>
            <ul>
              <li v-for="(line, i) in profile.audienceFindings" :key="i">{{ line }}</li>
            </ul>
          </div>
        </template>
      </section>

      <section class="card section">
        <div class="section-header">
          <h2>Payments</h2>
          <button
            v-if="editingSection !== 'payments'"
            type="button"
            class="edit-btn"
            aria-label="Edit payments"
            @click="startEdit('payments')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </button>
        </div>

        <template v-if="editingSection === 'payments'">
          <div class="field">
            <label for="editBankAccountHolder">Account Holder Name</label>
            <input
              id="editBankAccountHolder"
              v-model="form.bankAccountHolder"
              type="text"
              :class="{ 'has-error': errors.bankAccountHolder }"
            />
            <span v-if="errors.bankAccountHolder" class="error">{{ errors.bankAccountHolder }}</span>
          </div>
          <div class="field">
            <label for="editBankCountry">Country</label>
            <CountrySelect id="editBankCountry" v-model="form.bankCountry" />
            <span v-if="errors.bankCountry" class="error">{{ errors.bankCountry }}</span>
          </div>
          <div class="field">
            <label for="editBankName">Bank Name</label>
            <input
              id="editBankName"
              v-model="form.bankName"
              type="text"
              :class="{ 'has-error': errors.bankName }"
            />
            <span v-if="errors.bankName" class="error">{{ errors.bankName }}</span>
          </div>

          <template v-if="formFieldSet === 'us'">
            <div class="billing-row">
              <div class="field">
                <label for="editBankAccountNumber">Account Number</label>
                <input
                  id="editBankAccountNumber"
                  v-model="form.bankAccountNumber"
                  type="text"
                  inputmode="numeric"
                  :class="{ 'has-error': errors.bankAccountNumber }"
                />
                <span v-if="errors.bankAccountNumber" class="error">{{ errors.bankAccountNumber }}</span>
              </div>
              <div class="field">
                <label for="editBankRoutingNumber">Routing Number</label>
                <input
                  id="editBankRoutingNumber"
                  v-model="form.bankRoutingNumber"
                  type="text"
                  inputmode="numeric"
                  :class="{ 'has-error': errors.bankRoutingNumber }"
                />
                <span v-if="errors.bankRoutingNumber" class="error">{{ errors.bankRoutingNumber }}</span>
              </div>
            </div>
          </template>

          <template v-else-if="formFieldSet === 'il'">
            <div class="billing-row">
              <div class="field">
                <label for="editBankIlBankNumber">Bank Number</label>
                <input
                  id="editBankIlBankNumber"
                  v-model="form.bankIlBankNumber"
                  type="text"
                  inputmode="numeric"
                  :class="{ 'has-error': errors.bankIlBankNumber }"
                />
                <span v-if="errors.bankIlBankNumber" class="error">{{ errors.bankIlBankNumber }}</span>
              </div>
              <div class="field">
                <label for="editBankIlBranchNumber">Branch Number</label>
                <input
                  id="editBankIlBranchNumber"
                  v-model="form.bankIlBranchNumber"
                  type="text"
                  inputmode="numeric"
                  :class="{ 'has-error': errors.bankIlBranchNumber }"
                />
                <span v-if="errors.bankIlBranchNumber" class="error">{{ errors.bankIlBranchNumber }}</span>
              </div>
            </div>
            <div class="field">
              <label for="editBankAccountNumberIl">Account Number</label>
              <input
                id="editBankAccountNumberIl"
                v-model="form.bankAccountNumber"
                type="text"
                inputmode="numeric"
                :class="{ 'has-error': errors.bankAccountNumber }"
              />
              <span v-if="errors.bankAccountNumber" class="error">{{ errors.bankAccountNumber }}</span>
            </div>
          </template>

          <template v-else-if="formFieldSet === 'iban'">
            <div class="field">
              <label for="editBankIban">IBAN</label>
              <input
                id="editBankIban"
                v-model="form.bankIban"
                type="text"
                :class="{ 'has-error': errors.bankIban }"
              />
              <span v-if="errors.bankIban" class="error">{{ errors.bankIban }}</span>
            </div>
            <div class="field">
              <label for="editBankSwiftCodeIban">SWIFT / BIC Code</label>
              <input
                id="editBankSwiftCodeIban"
                v-model="form.bankSwiftCode"
                type="text"
                :class="{ 'has-error': errors.bankSwiftCode }"
              />
              <span v-if="errors.bankSwiftCode" class="error">{{ errors.bankSwiftCode }}</span>
            </div>
          </template>

          <template v-else>
            <div class="field">
              <label for="editBankAccountNumberOther">Account Number</label>
              <input
                id="editBankAccountNumberOther"
                v-model="form.bankAccountNumber"
                type="text"
                :class="{ 'has-error': errors.bankAccountNumber }"
              />
              <span v-if="errors.bankAccountNumber" class="error">{{ errors.bankAccountNumber }}</span>
            </div>
            <div class="field">
              <label for="editBankSwiftCodeOther">SWIFT / BIC Code</label>
              <input
                id="editBankSwiftCodeOther"
                v-model="form.bankSwiftCode"
                type="text"
                :class="{ 'has-error': errors.bankSwiftCode }"
              />
              <span v-if="errors.bankSwiftCode" class="error">{{ errors.bankSwiftCode }}</span>
            </div>
          </template>

          <div class="edit-actions">
            <button type="button" class="btn btn-secondary" @click="cancelEdit">Cancel</button>
            <button type="button" class="btn btn-primary" @click="savePayments">Save</button>
          </div>
        </template>
        <template v-else>
          <div class="field-row">
            <span class="field-label">Account Holder</span>
            <span class="field-value">{{ profile.bankAccountHolder || '—' }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Country</span>
            <span class="field-value">{{ countryName }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Bank</span>
            <span class="field-value">{{ profile.bankName || '—' }}</span>
          </div>
          <template v-if="bankFieldSet === 'us'">
            <div class="field-row">
              <span class="field-label">Account Number</span>
              <span class="field-value">{{ profile.bankAccountNumber || '—' }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Routing Number</span>
              <span class="field-value">{{ profile.bankRoutingNumber || '—' }}</span>
            </div>
          </template>
          <template v-else-if="bankFieldSet === 'il'">
            <div class="field-row">
              <span class="field-label">Bank Number</span>
              <span class="field-value">{{ profile.bankIlBankNumber || '—' }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Branch Number</span>
              <span class="field-value">{{ profile.bankIlBranchNumber || '—' }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Account Number</span>
              <span class="field-value">{{ profile.bankAccountNumber || '—' }}</span>
            </div>
          </template>
          <template v-else-if="bankFieldSet === 'iban'">
            <div class="field-row">
              <span class="field-label">IBAN</span>
              <span class="field-value">{{ profile.bankIban || '—' }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">SWIFT / BIC</span>
              <span class="field-value">{{ profile.bankSwiftCode || '—' }}</span>
            </div>
          </template>
          <template v-else>
            <div class="field-row">
              <span class="field-label">Account Number</span>
              <span class="field-value">{{ profile.bankAccountNumber || '—' }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">SWIFT / BIC</span>
              <span class="field-value">{{ profile.bankSwiftCode || '—' }}</span>
            </div>
          </template>
        </template>
      </section>
    </template>
  </main>
</template>

<style scoped>
.back-link {
  display: inline-block;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--text);
  text-decoration: none;
}
.back-link:hover {
  color: var(--text-h);
}
.page {
  position: relative;
}
/* .page shares .container's max-width:900px, so a plain background would only color that
   centered column — this pseudo-element covers the full viewport behind it instead. */
.page::before {
  content: '';
  position: fixed;
  inset: 0;
  background: #f6fffe;
  z-index: -1;
}
.hint {
  color: var(--text);
  margin: 4px 0 24px;
}
.empty {
  text-align: center;
  color: var(--text);
}
.section {
  margin-bottom: 20px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}
.section-header h2 {
  margin: 0;
}
.edit-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  padding: 4px;
}
.edit-btn svg {
  width: 16px;
  height: 16px;
}
.edit-btn:hover {
  color: var(--brand-red);
}
.field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 10px 0;
}
.field-row:not(:last-child) {
  border-bottom: 1px solid var(--border);
}
.field-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.field-value {
  font-size: 14px;
  color: var(--text-h);
  text-align: right;
}
.findings {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
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
.billing-row {
  display: flex;
  gap: 16px;
}
.billing-row .field {
  flex: 1;
}
.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}
.section :deep(.btn-primary) {
  background: var(--brand-red);
}
</style>
