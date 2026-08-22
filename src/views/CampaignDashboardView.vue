<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCampaignsStore } from '../stores/campaigns'
import { getEngagedInfluencerBreakdown } from '../services/api'
import { findInfluencerById } from '../services/mockInfluencers'
import { displayStatus, statusLabel } from '../utils/campaignStatus'
import { formatCompactNumber, formatCurrency } from '../utils/format'

const PROGRESS_COLOR_BY_STATUS = {
  live: 'var(--brand-teal)',
  pending: 'var(--brand-yellow)',
  completed: 'var(--brand-blue)',
  cancelled: 'var(--brand-red)',
}

const route = useRoute()
const campaignsStore = useCampaignsStore()
const loading = ref(true)

const campaign = computed(() => campaignsStore.getById(route.params.id))

const offerRows = computed(() => {
  if (!campaign.value) return []
  return campaign.value.offers.map((offer) => ({
    ...offer,
    influencer: campaign.value.recommendations.find((rec) => rec.influencerId === offer.influencerId),
  }))
})

// Mirrors the same stat set shown in the expand mode of a campaign card on My Campaigns.
const clicksAndViews = computed(() => {
  if (!campaign.value) return { clicks: 0, views: 0 }
  return getEngagedInfluencerBreakdown([campaign.value]).reduce(
    (acc, row) => ({ clicks: acc.clicks + row.clicks, views: acc.views + row.views }),
    { clicks: 0, views: 0 },
  )
})
const clicks = computed(() => clicksAndViews.value.clicks)
const ctr = computed(() => (clicksAndViews.value.views ? (clicksAndViews.value.clicks / clicksAndViews.value.views) * 100 : 0))
const spent = computed(() => (campaign.value?.dailyMetrics ?? []).reduce((sum, day) => sum + day.budgetSpent, 0))
const followers = computed(() =>
  (campaign.value?.selectedInfluencerIds ?? []).reduce((sum, id) => sum + (findInfluencerById(id)?.followers ?? 0), 0),
)

const progress = computed(() => {
  if (!campaign.value) return 0
  const bucket = displayStatus(campaign.value.status)
  if (bucket === 'completed') return 100
  if (bucket === 'pending') return 0
  const start = new Date(campaign.value.startDate).getTime()
  const end = new Date(campaign.value.endDate).getTime()
  if (!(end > start)) return 0
  const pct = ((Date.now() - start) / (end - start)) * 100
  return Math.min(100, Math.max(0, Math.round(pct)))
})
const progressColor = computed(() => {
  if (!campaign.value) return 'var(--brand-red)'
  return PROGRESS_COLOR_BY_STATUS[displayStatus(campaign.value.status)] ?? 'var(--brand-red)'
})

onMounted(async () => {
  try {
    await campaignsStore.fetchOne(route.params.id)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="container page">
    <RouterLink to="/advertiser" class="back-link">← Back to My Campaigns</RouterLink>

    <div v-if="loading">Loading campaign…</div>
    <div v-else-if="!campaign">Campaign not found.</div>

    <template v-else>
      <div class="header-row">
        <div>
          <h1>{{ campaign.campaignName || campaign.companyName }}</h1>
          <p class="hint">
            {{ campaign.companyName }} · {{ campaign.audienceIntent || campaign.categories.join(', ') }}
          </p>
        </div>
        <span class="badge" :class="`badge-${campaign.status}`">{{ statusLabel(campaign.status) }}</span>
      </div>

      <div v-if="campaign.status === 'processing'" class="card notice">
        <p>Your campaign is being processed — we'll notify you when recommendations are ready.</p>
      </div>

      <div v-else-if="campaign.status === 'recommendations_ready'" class="card notice">
        <p>AI recommendations are ready.</p>
        <RouterLink :to="`/advertiser/campaigns/${campaign.id}/recommendations`" class="btn btn-primary">
          View Recommendations
        </RouterLink>
      </div>

      <section class="card section">
        <h2>Creative Assets</h2>
        <div v-if="campaign.product.uploadKind === 'model'" class="model-asset">
          🧊 {{ campaign.product.modelFileName }}
        </div>
        <img
          v-else-if="campaign.product.imageDataUrl"
          :src="campaign.product.imageDataUrl"
          alt="Product creative"
          class="product-image"
        />
        <p v-if="campaign.product.scrapedName" class="hint">{{ campaign.product.scrapedName }}</p>
        <div v-if="campaign.product.pdpUrl" class="field-row">
          <span class="field-label">Purchase Page</span>
          <a
            :href="campaign.product.pdpUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="field-value product-link"
          >
            {{ campaign.product.pdpUrl }}
          </a>
        </div>
      </section>

      <section v-if="offerRows.length" class="card section">
        <h2>Selected Influencers</h2>
        <ul class="offer-list">
          <li v-for="row in offerRows" :key="row.id" class="offer-row">
            <img :src="row.influencer?.avatarUrl" alt="" class="avatar" />
            <div class="details">
              <strong>{{ row.influencer?.name }}</strong>
              <span class="handle">{{ row.influencer?.handle }}</span>
            </div>
            <span class="badge" :class="`badge-${row.status}`">{{ row.status }}</span>
          </li>
        </ul>
      </section>

      <section v-if="campaign.metrics" class="card section">
        <h2>Performance</h2>
        <div class="metrics">
          <div class="metric">
            <span class="metric-value">{{ formatCurrency(spent) }}</span>
            <span class="metric-label">Spent</span>
          </div>
          <div class="metric">
            <span class="metric-value">{{ campaign.selectedInfluencerIds.length }}</span>
            <span class="metric-label">Influencers</span>
          </div>
          <div class="metric">
            <span class="metric-value">{{ formatCompactNumber(followers) }}</span>
            <span class="metric-label">Followers</span>
          </div>
          <div class="metric">
            <span class="metric-value">{{ formatCompactNumber(campaign.metrics.impressions) }}</span>
            <span class="metric-label">Views</span>
          </div>
          <div class="metric">
            <span class="metric-value">{{ formatCompactNumber(clicks) }}</span>
            <span class="metric-label">Clicks</span>
          </div>
          <div class="metric">
            <span class="metric-value">{{ ctr.toFixed(1) }}%</span>
            <span class="metric-label">CTR</span>
          </div>
        </div>
        <div
          class="progress-track"
          role="progressbar"
          :aria-valuenow="progress"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div class="progress-fill" :style="{ width: progress + '%', background: progressColor }"></div>
        </div>
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
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}
.header-row h1 {
  margin-bottom: 4px;
}
.notice {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.notice p {
  margin: 0;
}
.section {
  margin-bottom: 20px;
}
.product-image {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border);
}
.model-asset {
  font-size: 15px;
}
.field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
}
.field-label {
  flex-shrink: 0;
}
.product-link {
  font-size: 13px;
  font-weight: 600;
  color: var(--brand-blue);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-link:hover {
  text-decoration: underline;
}
.offer-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.offer-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.details {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.handle {
  font-size: 13px;
  color: var(--text);
}
.metrics {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  margin-top: 20px;
}
.metric {
  display: flex;
  flex-direction: column;
}
.metric-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-h);
}
.metric-label {
  font-size: 13px;
  color: var(--text);
}
.progress-track {
  height: 6px;
  background: var(--code-bg);
  border-radius: 999px;
  overflow: hidden;
  margin-top: 20px;
}
.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}
@media (max-width: 640px) {
  .header-row {
    flex-wrap: wrap;
  }
  .metrics {
    gap: 20px;
  }
}
</style>
