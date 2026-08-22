<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useCampaignDraftStore } from '../../stores/campaignDraft'
import { useCampaignsStore } from '../../stores/campaigns'
import { useAdvertiserProfileStore } from '../../stores/advertiserProfile'
import StepProductAndInfluencer from './StepProductAndInfluencer.vue'
import CampaignMatchingFlow from './CampaignMatchingFlow.vue'

const props = defineProps({
  preferredInfluencerUrl: { type: String, default: '' },
})
const emit = defineEmits(['close'])

const draft = useCampaignDraftStore()
const campaignsStore = useCampaignsStore()
const profile = useAdvertiserProfileStore()

const stage = ref('form') // 'form' -> 'flow' (searching/results/placements/done, handled by the child)
const createdCampaignId = ref(null)
const stepComponentRef = ref(null)
const submitting = ref(false)
const showDiscardConfirm = ref(false)

onMounted(() => {
  // Guarantees a clean form on every open, regardless of how the previous session ended.
  draft.reset()
  if (props.preferredInfluencerUrl) {
    draft.preferredInfluencerUrl = props.preferredInfluencerUrl
  }
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

function attemptClose() {
  // Once past the form, the campaign already exists — closing early just means picking it back
  // up later from the campaign list, nothing entered is at risk of being lost.
  if (stage.value === 'form' && draft.isDirty) {
    showDiscardConfirm.value = true
    return
  }
  emit('close')
}

function cancelDiscard() {
  showDiscardConfirm.value = false
}

function restartFlow() {
  draft.reset()
  createdCampaignId.value = null
  stage.value = 'form'
}

function confirmDiscard() {
  showDiscardConfirm.value = false
  draft.reset()
  emit('close')
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10)
}

async function handleSubmit() {
  const valid = stepComponentRef.value?.validate?.() ?? true
  if (!valid) return

  submitting.value = true
  try {
    const today = new Date()
    const thirtyDaysOut = new Date(today)
    thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30)

    const payload = {
      companyName: profile.companyName,
      companyWebsite: profile.companyWebsite,
      categories: profile.categories,
      targetSegments: profile.targetSegments,
      targetGender: profile.targetGender,
      audienceIntent: profile.audienceIntent,
      campaignName: draft.campaignName,
      startDate: toIsoDate(today),
      endDate: toIsoDate(thirtyDaysOut),
      budget: Number(draft.budget),
      targetImpressions: draft.targetImpressions ? Number(draft.targetImpressions) : null,
      product: { ...draft.product },
      preferredInfluencerUrl: draft.preferredInfluencerUrl,
      billing: profile.billing,
    }
    const campaign = await campaignsStore.createCampaign(payload)
    draft.reset()
    createdCampaignId.value = campaign.id
    stage.value = 'flow'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="modal-backdrop" @click.self="attemptClose">
    <div
      class="modal-dialog card form-theme-red"
      :class="{ 'modal-dialog-wide': stage === 'flow' }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-modal-title"
    >
      <div class="modal-header">
        <h2 id="campaign-modal-title">Create Campaign</h2>
        <button type="button" class="modal-close" aria-label="Close" @click="attemptClose">×</button>
      </div>
      <p v-if="stage === 'form'" class="modal-subtitle">
        Request a product to be published seamlessly inside influencers content.
      </p>

      <div class="modal-body" :class="{ 'is-form': stage === 'form' }">
        <template v-if="stage === 'form'">
          <StepProductAndInfluencer
            ref="stepComponentRef"
            :expand-preferred-influencer="!!props.preferredInfluencerUrl"
          />
        </template>
        <CampaignMatchingFlow
          v-else
          :campaign-id="createdCampaignId"
          @close="emit('close')"
          @restart="restartFlow"
        />
      </div>

      <div v-if="stage === 'form'" class="step-actions">
        <button type="button" class="btn btn-secondary btn-discard" :disabled="submitting" @click="attemptClose">
          Discard
        </button>
        <button type="button" class="btn btn-primary" :disabled="submitting" @click="handleSubmit">
          {{ submitting ? 'Submitting…' : 'Create' }}
        </button>
      </div>
    </div>
  </div>

  <div v-if="showDiscardConfirm" class="modal-backdrop confirm-backdrop" @click.self="cancelDiscard">
    <div class="confirm-dialog card" role="alertdialog" aria-modal="true" aria-labelledby="discard-confirm-title">
      <h3 id="discard-confirm-title">Discard Campaign?</h3>
      <p>Your changes will not be saved.</p>
      <div class="confirm-actions">
        <button type="button" class="btn btn-secondary" @click="cancelDiscard">Cancel</button>
        <button type="button" class="btn btn-danger" @click="confirmDiscard">Discard</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 100;
}
@media (max-width: 640px) {
  .modal-backdrop {
    padding: 12px;
  }
  .modal-dialog {
    padding: 16px;
    max-height: 94vh;
  }
}
.modal-dialog {
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  transition: max-width 0.15s ease;
}
.modal-dialog::-webkit-scrollbar {
  display: none;
}
.modal-dialog-wide {
  max-width: 900px;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.modal-header h2 {
  margin: 0;
}
.modal-subtitle {
  color: var(--text);
  font-size: 14px;
  margin: 6px 0 20px;
}
.modal-close {
  background: none;
  border: none;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  color: var(--text);
  padding: 0 4px;
}
.modal-close:hover {
  color: var(--text-h);
}
.modal-body {
  text-align: left;
}
.modal-body.is-form :deep(h2) {
  font-size: 14px;
}
.btn-discard {
  color: var(--danger);
}
.btn-danger {
  background: var(--danger);
  color: #fff;
  border-color: transparent;
}

.confirm-backdrop {
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
 * and used app-wide: nav, badges, dashboards). Rather than change them globally, this
 * re-declares the tokens on the modal so only elements inside the campaign creation flow
 * inherit the brand red — everything outside this component is unaffected. Sourced from
 * the central --brand-red-* tokens (style.css), which already flip for dark mode.
 */
.form-theme-red {
  --accent: var(--brand-red);
  --accent-bg: var(--brand-red-bg);
  --accent-border: var(--brand-red-border);
}

/* Primary buttons anywhere in the Create Campaign flow (this form + the matching flow it hands
   off to) use the site's primary red rather than the app-wide pink .btn-primary. */
.modal-dialog :deep(.btn-primary) {
  background: var(--brand-red);
}
</style>
