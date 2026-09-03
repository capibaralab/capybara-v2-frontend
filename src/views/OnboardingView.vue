<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCampaignDraftStore } from '../stores/campaignDraft'
import { useAdvertiserProfileStore } from '../stores/advertiserProfile'
import { useInfluencerProfileStore } from '../stores/influencerProfile'
import StepAccountType from '../components/onboarding/StepAccountType.vue'
import StepAccount from '../components/onboarding/StepAccount.vue'
import StepBrandAudience from '../components/campaign-form/StepBrandAudience.vue'
import StepOnboardingBilling from '../components/onboarding/StepOnboardingBilling.vue'
import StepInfluencerInfo from '../components/onboarding/StepInfluencerInfo.vue'
import StepInfluencerAudience from '../components/onboarding/StepInfluencerAudience.vue'
import StepInfluencerPayments from '../components/onboarding/StepInfluencerPayments.vue'

const route = useRoute()
const router = useRouter()
const draft = useCampaignDraftStore()
const profile = useAdvertiserProfileStore()
const influencerProfile = useInfluencerProfileStore()

const ACCOUNT_TYPE_STEP = { key: 'account-type', label: 'Account Type', component: StepAccountType }
const BRAND_STEPS = [
  { key: 'account', label: 'Sign In', component: StepAccount },
  { key: 'company', label: 'Company Details', component: StepBrandAudience },
  { key: 'billing', label: 'Billing', component: StepOnboardingBilling },
]
const INFLUENCER_STEPS = [
  { key: 'account', label: 'Sign In', component: StepAccount },
  { key: 'influencer-info', label: 'Your Info', component: StepInfluencerInfo },
  { key: 'influencer-audience', label: 'Your Audience', component: StepInfluencerAudience },
  { key: 'influencer-payments', label: 'Payments', component: StepInfluencerPayments },
]

const steps = computed(() => [
  ACCOUNT_TYPE_STEP,
  ...(draft.accountType === 'influencer' ? INFLUENCER_STEPS : BRAND_STEPS),
])

const closeTarget = '/'
const currentIndex = computed(() => {
  const idx = steps.value.findIndex((step) => step.key === route.params.step)
  return idx === -1 ? 0 : idx
})
const isLastStep = computed(() => currentIndex.value === steps.value.length - 1)
const isBillingStep = computed(() => steps.value[currentIndex.value]?.key === 'billing')

// The account-type gate isn't part of the numbered stepper — it has no title of its own,
// and the stepper on every later screen starts counting from "Sign In"/"Your Info".
const visibleSteps = computed(() => steps.value.filter((step) => step.key !== 'account-type'))
const showStepper = computed(() => steps.value[currentIndex.value]?.key !== 'account-type')
const visibleCurrentIndex = computed(() =>
  visibleSteps.value.findIndex((step) => step.key === steps.value[currentIndex.value]?.key)
)

const stepComponentRef = ref(null)
const submitting = ref(false)
const showDiscardConfirm = ref(false)

onMounted(() => {
  // Guarantees a clean form on every fresh entry, regardless of how the previous session ended.
  draft.reset()
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

function onKeydown(event) {
  if (event.key !== 'Escape') return
  if (showDiscardConfirm.value) cancelDiscard()
  else attemptClose()
}

function stepRoute(key) {
  return { path: `/onboarding/${key}` }
}

function attemptClose() {
  if (draft.isDirty) {
    showDiscardConfirm.value = true
    return
  }
  router.push(closeTarget)
}

function cancelDiscard() {
  showDiscardConfirm.value = false
}

function confirmDiscard() {
  showDiscardConfirm.value = false
  draft.reset()
  router.push(closeTarget)
}

function back() {
  if (currentIndex.value > 0) router.push(stepRoute(steps.value[currentIndex.value - 1].key))
}

async function handleNext() {
  const valid = stepComponentRef.value?.validate?.() ?? true
  if (!valid) return

  if (!isLastStep.value) {
    router.push(stepRoute(steps.value[currentIndex.value + 1].key))
    return
  }

  submitting.value = true
  try {
    const isInfluencer = draft.accountType === 'influencer'
    if (isInfluencer) {
      influencerProfile.completeOnboarding({
        username: draft.username,
        email: draft.email,
        fullName: draft.fullName,
        instagramUrl: draft.instagramUrl,
        targetSegments: draft.targetSegments,
        targetGender: draft.targetGender,
        audienceIntent: draft.audienceIntent,
        audienceFindings: draft.audienceFindings,
        bankAccountHolder: draft.bankAccountHolder,
        bankName: draft.bankName,
        bankCountry: draft.bankCountry,
        bankAccountNumber: draft.bankAccountNumber,
        bankRoutingNumber: draft.bankRoutingNumber,
        bankIlBankNumber: draft.bankIlBankNumber,
        bankIlBranchNumber: draft.bankIlBranchNumber,
        bankIban: draft.bankIban,
        bankSwiftCode: draft.bankSwiftCode,
      })
    } else {
      profile.completeOnboarding({
        username: draft.username,
        email: draft.email,
        companyName: draft.companyName,
        companyWebsite: draft.companyWebsite,
        categories: draft.categories,
        targetSegments: draft.targetSegments,
        targetGender: draft.targetGender,
        audienceIntent: draft.audienceIntent,
        billing: { last4: draft.cardNumber.replace(/\D/g, '').slice(-4) },
      })
    }
    draft.reset()
    router.push(isInfluencer ? '/influencer' : closeTarget)
  } finally {
    submitting.value = false
  }
}

async function skipBilling() {
  submitting.value = true
  try {
    profile.completeOnboarding({
      username: draft.username,
      email: draft.email,
      companyName: draft.companyName,
      companyWebsite: draft.companyWebsite,
      categories: draft.categories,
      targetSegments: draft.targetSegments,
      targetGender: draft.targetGender,
      audienceIntent: draft.audienceIntent,
      billing: null,
    })
    draft.reset()
    router.push(closeTarget)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="container page onboarding-page form-theme-red">
    <div class="onboarding-card card">
      <div class="onboarding-header">
        <h2 id="onboarding-title">Get Started</h2>
      </div>

      <div v-if="showStepper" class="stepper">
        <span
          v-for="(step, index) in visibleSteps"
          :key="step.key"
          class="step"
          :class="{ active: index === visibleCurrentIndex, done: index < visibleCurrentIndex }"
        >
          {{ index + 1 }}. {{ step.label }}
        </span>
      </div>

      <div class="onboarding-body">
        <component :is="steps[currentIndex].component" ref="stepComponentRef" />
      </div>

      <div class="step-actions">
        <div class="step-actions-right">
          <button v-if="currentIndex > 0" type="button" class="btn btn-secondary" :disabled="submitting" @click="back">
            Back
          </button>
          <button v-if="isBillingStep" type="button" class="btn btn-secondary" :disabled="submitting" @click="skipBilling">
            Skip & Finish
          </button>
          <button type="button" class="btn btn-primary" :disabled="submitting" @click="handleNext">
            {{ submitting ? 'Saving…' : isLastStep ? 'Finish' : 'Next' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDiscardConfirm" class="modal-backdrop confirm-backdrop" @click.self="cancelDiscard">
      <div class="confirm-dialog card" role="alertdialog" aria-modal="true" aria-labelledby="onboarding-discard-title">
        <h3 id="onboarding-discard-title">Discard Onboarding?</h3>
        <p>Your changes will not be saved.</p>
        <div class="confirm-actions">
          <button type="button" class="btn btn-secondary" @click="cancelDiscard">Cancel</button>
          <button type="button" class="btn btn-danger" @click="confirmDiscard">Discard</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.page {
  position: relative;
}
/* .page shares .container's max-width:900px, so a plain background would only color that
   centered column — this pseudo-element covers the full viewport behind it instead. */
.page::before {
  content: '';
  position: fixed;
  inset: 0;
  background: #fff;
  z-index: -1;
}
.onboarding-card {
  text-align: left;
  background: #fff;
  border: none;
}
.onboarding-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.onboarding-header h2 {
  margin: 0;
}
.onboarding-body {
  text-align: left;
}
.onboarding-body :deep(h2) {
  font-size: 14px;
}
.step-actions {
  justify-content: flex-end;
}
.step-actions-right {
  display: flex;
  gap: 12px;
}
.btn-danger {
  background: var(--danger);
  color: #fff;
  border-color: transparent;
}

.confirm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 110;
}
.confirm-dialog {
  width: 100%;
  max-width: 360px;
  text-align: left;
}
.confirm-dialog h3 {
  margin: 0 0 8px;
}
.confirm-dialog p {
  margin: 0 0 20px;
  color: var(--text);
}
.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.confirm-actions .btn-secondary,
.confirm-actions .btn-secondary:hover:not(:disabled) {
  border-color: var(--brand-red);
}

/*
 * --accent / --accent-bg / --accent-border are shared design tokens (defined in style.css
 * and used app-wide). Re-declared here so only this page inherits the brand red, matching
 * the same pattern used by CampaignFormModal.vue.
 */
.form-theme-red {
  --accent: var(--brand-red);
  --accent-bg: var(--brand-red-bg);
  --accent-border: var(--brand-red-border);
}
.onboarding-card :deep(.btn-primary) {
  background: var(--brand-red);
}
</style>
