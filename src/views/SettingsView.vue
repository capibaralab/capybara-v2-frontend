<script setup>
import { computed, reactive, ref } from 'vue'
import { useAdvertiserProfileStore } from '../stores/advertiserProfile'
import { CATEGORY_OPTIONS, SEGMENT_OPTIONS, GENDER_OPTIONS } from '../services/constants'
import ChipMultiSelect from '../components/ChipMultiSelect.vue'
import InviteUserModal from '../components/InviteUserModal.vue'

const profile = useAdvertiserProfileStore()
const categoryOptions = CATEGORY_OPTIONS.map((category) => ({ value: category, label: category }))

const segmentLabels = computed(() => {
  const byValue = Object.fromEntries(SEGMENT_OPTIONS.map((opt) => [opt.value, opt.label]))
  return profile.targetSegments.map((value) => byValue[value] ?? value).join(', ')
})

const genderLabels = computed(() => {
  const byValue = Object.fromEntries(GENDER_OPTIONS.map((opt) => [opt.value, opt.label]))
  return profile.targetGender.map((value) => byValue[value] ?? value).join(', ')
})

const editingSection = ref(null)
const showInvite = ref(false)

const form = reactive({
  categories: [],
  targetSegments: [],
  targetGender: [],
  audienceIntent: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
})

const errors = reactive({
  categories: '',
  targetSegments: '',
  targetGender: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
})

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

function startEdit(section) {
  clearErrors()
  if (section === 'categories') {
    form.categories = [...profile.categories]
  } else if (section === 'audience') {
    form.targetSegments = [...profile.targetSegments]
    form.targetGender = [...profile.targetGender]
    form.audienceIntent = profile.audienceIntent
  } else if (section === 'billing') {
    form.cardNumber = ''
    form.expiry = ''
    form.cvc = ''
  }
  editingSection.value = section
}

function cancelEdit() {
  editingSection.value = null
}

function saveCategories() {
  errors.categories = form.categories.length ? '' : 'Select at least one category'
  if (errors.categories) return
  profile.categories = [...form.categories]
  editingSection.value = null
}

function saveAudience() {
  errors.targetSegments = form.targetSegments.length ? '' : 'Select at least one age segment'
  errors.targetGender = form.targetGender.length ? '' : 'Select at least one option'
  if (errors.targetSegments || errors.targetGender) return
  profile.targetSegments = [...form.targetSegments]
  profile.targetGender = [...form.targetGender]
  profile.audienceIntent = form.audienceIntent
  editingSection.value = null
}

function saveBilling() {
  const digits = form.cardNumber.replace(/\s+/g, '')
  errors.cardNumber = /^\d{13,19}$/.test(digits) ? '' : 'Enter a valid card number'
  errors.expiry = /^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry.trim()) ? '' : 'Use MM/YY format'
  errors.cvc = /^\d{3,4}$/.test(form.cvc.trim()) ? '' : 'Enter a valid CVC'
  if (errors.cardNumber || errors.expiry || errors.cvc) return
  profile.billing = { last4: digits.slice(-4) }
  editingSection.value = null
}
</script>

<template>
  <main class="container page">
    <RouterLink to="/" class="back-link">← Back to Dashboard</RouterLink>

    <h1>Settings</h1>
    <p class="hint">Your account and company profile, as set up during onboarding.</p>

    <p v-if="!profile.onboarded" class="empty card">
      You haven't completed onboarding yet — this page will fill in once you do.
    </p>

    <template v-else>
      <section class="card section">
        <div class="section-header">
          <h2>Users</h2>
          <button type="button" class="btn btn-secondary btn-invite" @click="showInvite = true">Invite</button>
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
          <h2>Company Information</h2>
        </div>

        <div class="field-row">
          <span class="field-label">Name</span>
          <span class="field-value">{{ profile.companyName }}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Website</span>
          <span class="field-value">{{ profile.companyWebsite }}</span>
        </div>
      </section>

      <section class="card section">
        <div class="section-header">
          <h2>Categories</h2>
          <button
            v-if="editingSection !== 'categories'"
            type="button"
            class="edit-btn"
            aria-label="Edit categories"
            @click="startEdit('categories')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </button>
        </div>

        <template v-if="editingSection === 'categories'">
          <div class="field">
            <ChipMultiSelect v-model="form.categories" :options="categoryOptions" />
            <span v-if="errors.categories" class="error">{{ errors.categories }}</span>
          </div>
          <div class="edit-actions">
            <button type="button" class="btn btn-secondary" @click="cancelEdit">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveCategories">Save</button>
          </div>
        </template>
        <template v-else>
          <div v-if="profile.categories.length" class="chip-list">
            <span v-for="category in profile.categories" :key="category" class="chip-static">{{ category }}</span>
          </div>
          <p v-else class="hint">No categories set.</p>
        </template>
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
          <div class="field">
            <label for="editAudienceIntent">Intent</label>
            <input id="editAudienceIntent" v-model="form.audienceIntent" type="text" />
          </div>
          <div class="edit-actions">
            <button type="button" class="btn btn-secondary" @click="cancelEdit">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveAudience">Save</button>
          </div>
        </template>
        <template v-else>
          <div class="field-row">
            <span class="field-label">Segment</span>
            <span class="field-value">{{ segmentLabels }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Gender</span>
            <span class="field-value">{{ genderLabels }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Intent</span>
            <span class="field-value">{{ profile.audienceIntent || '—' }}</span>
          </div>
        </template>
      </section>

      <section class="card section">
        <div class="section-header">
          <h2>Billing</h2>
          <button
            v-if="editingSection !== 'billing'"
            type="button"
            class="edit-btn"
            aria-label="Edit billing"
            @click="startEdit('billing')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </button>
        </div>

        <template v-if="editingSection === 'billing'">
          <div class="field">
            <label for="editCardNumber">Card Number</label>
            <input
              id="editCardNumber"
              v-model="form.cardNumber"
              type="text"
              inputmode="numeric"
              :class="{ 'has-error': errors.cardNumber }"
              placeholder="4242 4242 4242 4242"
            />
            <span v-if="errors.cardNumber" class="error">{{ errors.cardNumber }}</span>
          </div>
          <div class="billing-row">
            <div class="field">
              <label for="editExpiry">Expiry</label>
              <input id="editExpiry" v-model="form.expiry" type="text" :class="{ 'has-error': errors.expiry }" placeholder="MM/YY" />
              <span v-if="errors.expiry" class="error">{{ errors.expiry }}</span>
            </div>
            <div class="field">
              <label for="editCvc">CVC</label>
              <input
                id="editCvc"
                v-model="form.cvc"
                type="text"
                inputmode="numeric"
                :class="{ 'has-error': errors.cvc }"
                placeholder="123"
              />
              <span v-if="errors.cvc" class="error">{{ errors.cvc }}</span>
            </div>
          </div>
          <div class="edit-actions">
            <button type="button" class="btn btn-secondary" @click="cancelEdit">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveBilling">Save</button>
          </div>
        </template>
        <div v-else class="field-row">
          <span class="field-label">Card Number</span>
          <span class="field-value">•••• •••• •••• {{ profile.billing?.last4 ?? '····' }}</span>
        </div>
      </section>
    </template>

    <InviteUserModal v-if="showInvite" @close="showInvite = false" />
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
.btn-invite {
  border-color: var(--brand-red);
  color: var(--brand-red);
  padding: 6px 14px;
  font-size: 13px;
}
.btn-invite:hover:not(:disabled) {
  background: var(--brand-red-bg);
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
.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip-static {
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 13px;
  color: var(--text-h);
  background: var(--code-bg);
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
