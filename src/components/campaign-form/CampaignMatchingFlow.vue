<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useCampaignsStore } from '../../stores/campaigns'
import { formatCompactNumber, formatCurrency } from '../../utils/format'
import logo from '../../assets/logo.png'

const props = defineProps({
  campaignId: { type: String, required: true },
})
const emit = defineEmits(['close', 'restart'])

const campaignsStore = useCampaignsStore()

// Fixed positions (percent of the media box) for up to 3 numbered placement markers.
const MARKER_POSITIONS = [
  { top: '18%', left: '62%' },
  { top: '52%', left: '20%' },
  { top: '76%', left: '68%' },
]

const stage = ref('searching') // searching -> results -> placements -> review -> done
const matches = ref([])
const selectedIds = ref([])
const activeInfluencerId = ref(null)
const placementSelections = reactive({}) // influencerId -> placementId
const finalSubmitting = ref(false)

onMounted(async () => {
  const updated = await campaignsStore.runMatching(props.campaignId)
  matches.value = updated.recommendations
  selectedIds.value = updated.recommendations.map((rec) => rec.influencerId)
  stage.value = 'results'
})

function isSelected(id) {
  return selectedIds.value.includes(id)
}

function toggleSelect(id) {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(index, 1)
}

const selectedInfluencers = computed(() => matches.value.filter((m) => isSelected(m.influencerId)))

// The placement-picking and review steps ('placements' and 'review' stages below) are skipped
// for now — kept in place in case they're wanted again later. Each influencer still defaults to
// their highest-priced placement (so review's pricing would work if it were re-enabled), and
// this goes straight to sending offers and showing the final confirmation.
async function confirmSelection() {
  selectedInfluencers.value.forEach((inf) => {
    const best = [...inf.placements].sort((a, b) => b.price - a.price)[0]
    placementSelections[inf.influencerId] = best.id
  })
  finalSubmitting.value = true
  try {
    await campaignsStore.sendOffers(props.campaignId, selectedIds.value)
    stage.value = 'done'
  } finally {
    finalSubmitting.value = false
  }
}

const activeInfluencer = computed(() =>
  selectedInfluencers.value.find((m) => m.influencerId === activeInfluencerId.value),
)

const activePlacements = computed(() => {
  if (!activeInfluencer.value) return []
  return [...activeInfluencer.value.placements]
    .sort((a, b) => b.price - a.price)
    .map((placement, index) => ({ ...placement, number: index + 1 }))
})

const pendingInfluencers = computed(() =>
  selectedInfluencers.value.filter((inf) => !placementSelections[inf.influencerId]),
)
const allPlacementsChosen = computed(() => pendingInfluencers.value.length === 0)

function selectPlacement(influencerId, placementId) {
  placementSelections[influencerId] = placementId
}

function chosenPlacementFor(influencer) {
  const placementId = placementSelections[influencer.influencerId]
  return influencer.placements.find((p) => p.id === placementId)
}

const totalPrice = computed(() =>
  selectedInfluencers.value.reduce((sum, inf) => sum + (chosenPlacementFor(inf)?.price ?? 0), 0),
)

async function confirmCampaign() {
  finalSubmitting.value = true
  try {
    await campaignsStore.sendOffers(props.campaignId, selectedIds.value)
    stage.value = 'done'
  } finally {
    finalSubmitting.value = false
  }
}
</script>

<template>
  <div class="flow">
    <div v-if="stage === 'searching'" class="stage stage-center">
      <div class="spinner" aria-hidden="true"></div>
      <h2>Finding your best-matched influencers based on your audience</h2>
      <p class="hint">This usually takes about 20 seconds.</p>
    </div>

    <div v-else-if="stage === 'results'" class="stage">
      <h2>Influencers that matches your brand</h2>
      <p class="hint">All matched influencers are selected — deselect any you'd like to leave out.</p>

      <ul class="result-list">
        <li
          v-for="match in matches"
          :key="match.influencerId"
          class="result-card"
          :class="{ selected: isSelected(match.influencerId) }"
          role="button"
          tabindex="0"
          @click="toggleSelect(match.influencerId)"
          @keydown.enter="toggleSelect(match.influencerId)"
        >
          <div class="avatar-wrap">
            <img :src="match.avatarUrl" alt="" class="result-avatar" />
            <span v-if="isSelected(match.influencerId)" class="selected-check" aria-hidden="true">✓</span>
          </div>
          <span class="followers">{{ formatCompactNumber(match.followers) }} followers</span>
        </li>
      </ul>

      <div class="stage-actions">
        <span class="hint">{{ selectedIds.length }} selected</span>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="!selectedIds.length || finalSubmitting"
          @click="confirmSelection"
        >
          {{ finalSubmitting ? 'Sending…' : 'Collaborate' }}
        </button>
      </div>
    </div>

    <div v-else-if="stage === 'placements'" class="stage">
      <p class="hint">Pick one placement for each influencer.</p>

      <div class="placement-tabs">
        <button
          v-for="inf in selectedInfluencers"
          :key="inf.influencerId"
          type="button"
          class="placement-tab"
          :class="{ active: inf.influencerId === activeInfluencerId }"
          @click="activeInfluencerId = inf.influencerId"
        >
          <img :src="inf.avatarUrl" alt="" class="tab-avatar" />
          <span>{{ inf.name }}</span>
          <span v-if="placementSelections[inf.influencerId]" class="tab-check" aria-hidden="true">✓</span>
          <span v-else class="tab-pending" aria-hidden="true">•</span>
        </button>
      </div>

      <div v-if="activeInfluencer" class="placement-picker">
        <div class="picker-media">
          <img :src="activeInfluencer.contentThumbnailUrl" alt="" />
          <button
            v-for="placement in activePlacements"
            :key="placement.id"
            type="button"
            class="marker"
            :class="{ selected: placementSelections[activeInfluencerId] === placement.id }"
            :style="MARKER_POSITIONS[placement.number - 1]"
            :aria-label="`Select placement ${placement.number}`"
            @click="selectPlacement(activeInfluencerId, placement.id)"
          >
            {{ placement.number }}
          </button>
        </div>
        <ul class="picker-list">
          <li
            v-for="placement in activePlacements"
            :key="placement.id"
            class="picker-card"
            :class="{ selected: placementSelections[activeInfluencerId] === placement.id }"
            @click="selectPlacement(activeInfluencerId, placement.id)"
          >
            <div class="picker-card-header">
              <span class="picker-number">{{ placement.number }}</span>
              <span class="placement-title">{{ placement.title }}</span>
            </div>
            <p class="placement-description">{{ placement.description }}</p>
            <div class="viewability">
              <div class="viewability-bar">
                <div class="viewability-fill" :style="{ width: placement.viewabilityPercent + '%' }"></div>
              </div>
              <span class="viewability-label">{{ placement.viewabilityPercent }}% viewability</span>
            </div>
            <span class="placement-price">{{ formatCurrency(placement.price) }}</span>
          </li>
        </ul>
      </div>

      <div class="stage-actions">
        <span class="hint">
          {{
            allPlacementsChosen
              ? 'All influencers have a placement selected.'
              : `${pendingInfluencers.length} influencer(s) still need a placement`
          }}
        </span>
        <button type="button" class="btn btn-primary" :disabled="!allPlacementsChosen" @click="stage = 'review'">
          Continue to Review
        </button>
      </div>
    </div>

    <div v-else-if="stage === 'review'" class="stage">
      <h2>Review your campaign</h2>
      <ul class="review-list">
        <li v-for="inf in selectedInfluencers" :key="inf.influencerId" class="review-row">
          <img :src="inf.contentThumbnailUrl" alt="" class="review-thumb" />
          <div class="review-details">
            <strong>{{ inf.name }}</strong>
            <span>{{ chosenPlacementFor(inf)?.title }} — {{ chosenPlacementFor(inf)?.description }}</span>
          </div>
          <span class="review-price">{{ formatCurrency(chosenPlacementFor(inf)?.price ?? 0) }}</span>
        </li>
      </ul>
      <div class="review-total">
        <span>Total</span>
        <strong>{{ formatCurrency(totalPrice) }}</strong>
      </div>
      <div class="stage-actions">
        <span></span>
        <button type="button" class="btn btn-primary" :disabled="finalSubmitting" @click="confirmCampaign">
          {{ finalSubmitting ? 'Sending…' : 'Confirm Campaign' }}
        </button>
      </div>
    </div>

    <div v-else-if="stage === 'done'" class="stage stage-center">
      <img :src="logo" alt="" class="done-icon" />
      <h2>You're all set</h2>
      <p>
        Your campaign has been sent to the selected influencers for approval. We'll notify you as
        soon as it's live.
      </p>
      <button type="button" class="btn btn-primary" @click="$emit('restart')">Create another campaign</button>
    </div>
  </div>
</template>

<style scoped>
.stage {
  min-height: 320px;
  display: flex;
  flex-direction: column;
}
.stage-center {
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  padding: 32px 16px;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 8px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.done-icon {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.result-list {
  list-style: none;
  margin: 20px 0;
  padding: 4px 2px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px 16px;
  max-height: 420px;
  overflow-y: auto;
}
.result-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 10px;
  border-radius: 12px;
  cursor: pointer;
}
.result-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.result-card.selected {
  background: var(--accent-bg);
}
.avatar-wrap {
  position: relative;
  width: 64px;
  height: 64px;
}
.result-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}
.selected-check {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  border: 2px solid var(--bg-raised);
}
.followers {
  font-size: 12px;
  color: var(--text);
}

@media (max-width: 640px) {
  .result-list {
    gap: 16px 10px;
  }
  .avatar-wrap {
    width: 52px;
    height: 52px;
  }
  .result-avatar {
    width: 52px;
    height: 52px;
  }
}

.stage-actions {
  margin-top: auto;
  padding-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.placement-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin-bottom: 16px;
  padding-bottom: 4px;
}
.placement-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: none;
  cursor: pointer;
  font-size: 13px;
  color: var(--text);
}
.placement-tab.active {
  border-color: var(--accent);
  color: var(--text-h);
  background: var(--accent-bg);
}
.tab-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
.tab-check {
  color: var(--success);
  font-weight: 700;
}
.tab-pending {
  color: var(--danger);
  font-size: 18px;
  line-height: 0;
}

.placement-picker {
  display: flex;
  gap: 24px;
  flex: 1;
}
.picker-media {
  position: relative;
  flex: 0 0 200px;
}
@media (max-width: 640px) {
  .placement-picker {
    flex-direction: column;
  }
  .picker-media {
    flex: 0 0 auto;
    width: 100%;
    max-width: 260px;
    margin: 0 auto;
  }
  .picker-list {
    max-height: none;
  }
}
.picker-media img {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}
.marker {
  position: absolute;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-h);
  border: 2px solid var(--border);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  transform: translate(-50%, -50%);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}
.marker.selected {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.picker-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 380px;
  overflow-y: auto;
}
.picker-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
}
.picker-card.selected {
  border: 2px solid var(--accent);
  padding: 13px 15px;
  background: var(--accent-bg);
}
.picker-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.picker-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--code-bg);
  color: var(--text-h);
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.picker-card.selected .picker-number {
  background: var(--accent);
  color: #fff;
}
.placement-title {
  font-weight: 600;
  color: var(--text-h);
}
.placement-description {
  font-size: 13px;
  color: var(--text);
  margin: 0 0 10px;
}
.viewability {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.viewability-bar {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: var(--code-bg);
  overflow: hidden;
}
.viewability-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 999px;
}
.viewability-label {
  font-size: 12px;
  color: var(--text);
  white-space: nowrap;
}
.placement-price {
  font-weight: 700;
  color: var(--text-h);
}

.review-list {
  list-style: none;
  margin: 20px 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 340px;
  overflow-y: auto;
}
.review-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
}
.review-thumb {
  width: 48px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}
.review-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.review-details span {
  font-size: 13px;
  color: var(--text);
}
.review-price {
  font-weight: 700;
  color: var(--text-h);
  flex-shrink: 0;
}
.review-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid var(--border);
  font-size: 16px;
}
.review-total strong {
  font-size: 20px;
  color: var(--text-h);
}
</style>
