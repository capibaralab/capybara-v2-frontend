<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCampaignsStore } from '../stores/campaigns'
import { formatCompactNumber } from '../utils/format'

const route = useRoute()
const router = useRouter()
const campaignsStore = useCampaignsStore()

const loading = ref(true)
const sending = ref(false)
const selectedIds = ref([])

const campaign = computed(() => campaignsStore.getById(route.params.id))

onMounted(async () => {
  try {
    await campaignsStore.fetchOne(route.params.id)
  } finally {
    loading.value = false
  }
})

function toggle(influencerId) {
  const index = selectedIds.value.indexOf(influencerId)
  if (index === -1) selectedIds.value.push(influencerId)
  else selectedIds.value.splice(index, 1)
}

async function continueToOffers() {
  sending.value = true
  try {
    await campaignsStore.sendOffers(campaign.value.id, selectedIds.value)
    router.push(`/advertiser/campaigns/${campaign.value.id}`)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <main class="container">
    <div v-if="loading">Loading recommendations…</div>
    <div v-else-if="!campaign">Campaign not found.</div>

    <div v-else-if="campaign.status === 'processing'" class="card">
      <h2>Still processing</h2>
      <p>This campaign's AI recommendations aren't ready yet. Check back shortly.</p>
      <RouterLink :to="`/advertiser/campaigns/${campaign.id}`" class="btn btn-secondary">Back to dashboard</RouterLink>
    </div>

    <div v-else-if="campaign.status !== 'recommendations_ready'" class="card">
      <h2>Offers already sent</h2>
      <p>Collaboration requests have already gone out for this campaign.</p>
      <RouterLink :to="`/advertiser/campaigns/${campaign.id}`" class="btn btn-secondary">Go to dashboard</RouterLink>
    </div>

    <template v-else>
      <h1>Recommended Influencers</h1>
      <p class="hint">
        For {{ campaign.campaignName || campaign.companyName }} — select who you'd like to send
        collaboration offers to.
      </p>

      <ul class="influencer-list">
        <li v-for="rec in campaign.recommendations" :key="rec.influencerId" class="card influencer-row">
          <label class="row-inner">
            <input
              type="checkbox"
              :checked="selectedIds.includes(rec.influencerId)"
              @change="toggle(rec.influencerId)"
            />
            <img :src="rec.avatarUrl" alt="" class="avatar" />
            <div class="details">
              <div class="name-row">
                <strong>{{ rec.name }}</strong>
                <span class="handle">{{ rec.handle }}</span>
                <span v-if="rec.isPreferred" class="badge badge-recommendations_ready">Preferred</span>
              </div>
              <div class="meta">
                {{ formatCompactNumber(rec.followers) }} followers · {{ rec.categories.join(', ') }}
              </div>
            </div>
            <div class="score">
              <span class="score-value">{{ rec.matchScore }}%</span>
              <span class="score-label">match</span>
            </div>
          </label>
        </li>
      </ul>

      <div class="step-actions">
        <span class="hint">{{ selectedIds.length }} selected</span>
        <button type="button" class="btn btn-primary" :disabled="!selectedIds.length || sending" @click="continueToOffers">
          {{ sending ? 'Sending…' : 'Continue' }}
        </button>
      </div>
    </template>
  </main>
</template>

<style scoped>
.influencer-list {
  list-style: none;
  margin: 24px 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.influencer-row {
  padding: 16px 20px;
}
.row-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}
.details {
  flex: 1;
  min-width: 0;
}
.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.handle {
  color: var(--text);
  font-size: 14px;
}
.meta {
  font-size: 13px;
  color: var(--text);
  margin-top: 2px;
}
.score {
  text-align: right;
}
.score-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
}
.score-label {
  font-size: 12px;
  color: var(--text);
}

@media (max-width: 640px) {
  .influencer-row {
    padding: 14px 16px;
  }
  .row-inner {
    flex-wrap: wrap;
  }
  .details {
    flex: 1 1 140px;
  }
  .score {
    flex: 1 1 100%;
    text-align: left;
  }
}
</style>
