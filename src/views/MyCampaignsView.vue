<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import CreateCampaignButton from '../components/CreateCampaignButton.vue'
import { useCampaignsStore } from '../stores/campaigns'
import { getEngagedInfluencerBreakdown } from '../services/api'
import { displayStatus, displayStatusLabel } from '../utils/campaignStatus'
import { formatCompactNumber, formatCurrency } from '../utils/format'
import { findInfluencerById } from '../services/mockInfluencers'
import SelectDropdown from '../components/SelectDropdown.vue'

const route = useRoute()
const campaignsStore = useCampaignsStore()

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'live', label: 'Live' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
]

const SORT_OPTIONS = [
  { value: 'date', label: 'Date created' },
  { value: 'budget', label: 'Budget' },
  { value: 'views', label: 'Views' },
  { value: 'ctr', label: 'CTR' },
  { value: 'clicks', label: 'Clicks' },
  { value: 'influencer', label: 'Influencer' },
]

const PROGRESS_COLOR_BY_STATUS = {
  live: 'var(--brand-teal)',
  pending: 'var(--brand-yellow)',
  completed: 'var(--brand-blue)',
  cancelled: 'var(--brand-red)',
}

const initialStatus = STATUS_FILTERS.some((filter) => filter.value === route.query.status)
  ? route.query.status
  : 'all'
const statusFilter = ref(initialStatus)
const sortBy = ref('date')
const sortDir = ref('desc')
const searchQuery = ref('')
const influencerFilter = ref('all')
const showFilters = ref(false)
const expandedCards = reactive({})

onMounted(() => {
  campaignsStore.fetchAll()
})

function influencerNamesOf(campaign) {
  return campaign.selectedInfluencerIds.map((id) => findInfluencerById(id)?.name).filter(Boolean)
}

function productNameOf(campaign) {
  return campaign.product?.scrapedName || campaign.product?.fileName || campaign.product?.modelFileName || ''
}

function toggleExpand(id) {
  expandedCards[id] = !expandedCards[id]
}

const influencerOptions = computed(() => {
  const names = new Set()
  campaignsStore.campaigns.forEach((campaign) => influencerNamesOf(campaign).forEach((name) => names.add(name)))
  return [
    { value: 'all', label: 'All influencers' },
    ...[...names].sort().map((name) => ({ value: name, label: name })),
  ]
})

// Clicks/CTR only exist as a per-influencer breakdown (see getEngagedInfluencerBreakdown) —
// this aggregates them up to campaign level once, for sorting.
const clicksAndCtrByCampaignId = computed(() => {
  const map = new Map()
  getEngagedInfluencerBreakdown(campaignsStore.campaigns).forEach((row) => {
    const entry = map.get(row.campaignId) || { clicks: 0, views: 0 }
    entry.clicks += row.clicks
    entry.views += row.views
    map.set(row.campaignId, entry)
  })
  return map
})

function clicksOf(campaign) {
  return clicksAndCtrByCampaignId.value.get(campaign.id)?.clicks ?? 0
}

function ctrOf(campaign) {
  const entry = clicksAndCtrByCampaignId.value.get(campaign.id)
  return entry && entry.views ? (entry.clicks / entry.views) * 100 : 0
}

function spentOf(campaign) {
  return (campaign.dailyMetrics ?? []).reduce((sum, day) => sum + day.budgetSpent, 0)
}

function followersOf(campaign) {
  return campaign.selectedInfluencerIds.reduce((sum, id) => sum + (findInfluencerById(id)?.followers ?? 0), 0)
}

const visibleCampaigns = computed(() => {
  let list = campaignsStore.campaigns
  if (statusFilter.value !== 'all') {
    list = list.filter((campaign) => displayStatus(campaign.status) === statusFilter.value)
  }
  if (influencerFilter.value !== 'all') {
    list = list.filter((campaign) => influencerNamesOf(campaign).includes(influencerFilter.value))
  }
  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    list = list.filter((campaign) => {
      const haystack = [campaign.campaignName, campaign.companyName, productNameOf(campaign), ...influencerNamesOf(campaign)]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }

  const sorted = [...list]
  const dir = sortDir.value === 'desc' ? -1 : 1
  if (sortBy.value === 'budget') {
    sorted.sort((a, b) => ((a.budget ?? 0) - (b.budget ?? 0)) * dir)
  } else if (sortBy.value === 'views') {
    sorted.sort((a, b) => ((a.metrics?.impressions ?? 0) - (b.metrics?.impressions ?? 0)) * dir)
  } else if (sortBy.value === 'ctr') {
    sorted.sort((a, b) => (ctrOf(a) - ctrOf(b)) * dir)
  } else if (sortBy.value === 'clicks') {
    sorted.sort((a, b) => (clicksOf(a) - clicksOf(b)) * dir)
  } else if (sortBy.value === 'influencer') {
    sorted.sort((a, b) => (a.selectedInfluencerIds.length - b.selectedInfluencerIds.length) * dir)
  } else {
    sorted.sort((a, b) => (new Date(a.createdAt) - new Date(b.createdAt)) * dir)
  }
  return sorted
})

function hasPerformanceStats(campaign) {
  const bucket = displayStatus(campaign.status)
  return bucket === 'live' || bucket === 'completed'
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function campaignProgress(campaign) {
  const bucket = displayStatus(campaign.status)
  if (bucket === 'completed') return 100
  if (bucket === 'pending') return 0
  const start = new Date(campaign.startDate).getTime()
  const end = new Date(campaign.endDate).getTime()
  if (!(end > start)) return 0
  const pct = ((Date.now() - start) / (end - start)) * 100
  return Math.min(100, Math.max(0, Math.round(pct)))
}

function progressColor(campaign) {
  return PROGRESS_COLOR_BY_STATUS[displayStatus(campaign.status)] ?? 'var(--brand-red)'
}
</script>

<template>
  <main class="container page-theme-red page">
    <RouterLink to="/" class="back-link">← Back to Dashboard</RouterLink>

    <div class="header-row">
      <h1>Campaigns</h1>
      <CreateCampaignButton label="Create" />
    </div>

    <p v-if="!campaignsStore.campaigns.length" class="empty card">
      No campaigns yet. Create your first campaign to get AI-matched influencer recommendations.
    </p>

    <template v-else>
      <div class="toolbar">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search by campaign, product, or influencer…"
        />
        <button
          type="button"
          class="filter-toggle-btn"
          :class="{ active: showFilters }"
          aria-label="Toggle filters"
          @click="showFilters = !showFilters"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </button>
      </div>

      <div v-if="showFilters" class="filter-row">
        <label class="filter-inline">
          <span class="filter-label">Status</span>
          <SelectDropdown v-model="statusFilter" :options="STATUS_FILTERS" />
        </label>
        <label class="filter-inline">
          <span class="filter-label">Influencer</span>
          <SelectDropdown v-model="influencerFilter" :options="influencerOptions" />
        </label>
        <label class="filter-inline">
          <span class="filter-label">Sort by</span>
          <SelectDropdown v-model="sortBy" :options="SORT_OPTIONS" />
        </label>
        <button type="button" class="sort-dir-btn" @click="sortDir = sortDir === 'asc' ? 'desc' : 'asc'">
          {{ sortDir === 'asc' ? '▲ Asc' : '▼ Desc' }}
        </button>
      </div>

      <p v-if="!visibleCampaigns.length" class="empty card">No campaigns match these filters.</p>

      <ul v-else class="campaign-list">
        <li v-for="campaign in visibleCampaigns" :key="campaign.id" class="card campaign-card">
          <button type="button" class="campaign-top" @click="toggleExpand(campaign.id)">
            <div class="campaign-identity">
              <RouterLink :to="`/advertiser/campaigns/${campaign.id}`" class="campaign-name" @click.stop>
                {{ campaign.campaignName || campaign.companyName }}
              </RouterLink>
              <span class="campaign-date">Created {{ formatDate(campaign.createdAt) }} · {{ formatCurrency(campaign.budget) }}</span>
            </div>
            <span class="badge" :class="`badge-${campaign.status}`">{{ displayStatusLabel(campaign.status) }}</span>
            <span class="expand-chevron" :class="{ open: expandedCards[campaign.id] }" aria-hidden="true">⌄</span>
          </button>

          <div class="card-divider"></div>

          <div v-if="expandedCards[campaign.id]" class="campaign-details">
            <div class="detail-stats">
              <div class="detail-stat">
                <span>Spent</span>
                <strong>{{ formatCurrency(spentOf(campaign)) }}</strong>
              </div>
              <div class="detail-stat">
                <span>Influencers</span>
                <strong>{{ campaign.selectedInfluencerIds.length }}</strong>
              </div>
              <div class="detail-stat">
                <span>Followers</span>
                <strong>{{ formatCompactNumber(followersOf(campaign)) }}</strong>
              </div>
              <template v-if="hasPerformanceStats(campaign)">
                <div class="detail-stat">
                  <span>Views</span>
                  <strong>{{ formatCompactNumber(campaign.metrics?.impressions ?? 0) }}</strong>
                </div>
                <div class="detail-stat">
                  <span>Clicks</span>
                  <strong>{{ formatCompactNumber(clicksOf(campaign)) }}</strong>
                </div>
                <div class="detail-stat">
                  <span>CTR</span>
                  <strong>{{ ctrOf(campaign).toFixed(1) }}%</strong>
                </div>
              </template>
            </div>
            <div
              class="progress-track"
              role="progressbar"
              :aria-valuenow="campaignProgress(campaign)"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                class="progress-fill"
                :style="{ width: campaignProgress(campaign) + '%', background: progressColor(campaign) }"
              ></div>
            </div>
          </div>
        </li>
      </ul>
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
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}
.header-row h1 {
  margin: 0;
}
.empty {
  text-align: center;
  color: var(--text);
}
.toolbar {
  display: flex;
  align-items: stretch;
  gap: 10px;
  margin-bottom: 12px;
}
.search-input {
  flex: 1;
}
.filter-toggle-btn {
  flex: 0 0 auto;
  width: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
}
.filter-toggle-btn svg {
  width: 18px;
  height: 18px;
}
.filter-toggle-btn:hover,
.filter-toggle-btn.active {
  border-color: var(--accent-border);
  color: var(--accent);
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
}
.filter-inline {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-h);
  white-space: nowrap;
}
.sort-dir-btn {
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  cursor: pointer;
}
.campaign-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.campaign-card {
  padding: 0;
  overflow: hidden;
}
.campaign-top {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
}
.campaign-identity {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.campaign-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-h);
  text-decoration: none;
}
.campaign-name:hover {
  text-decoration: underline;
}
.campaign-date {
  font-size: 12px;
  color: var(--text);
}
.expand-chevron {
  flex-shrink: 0;
  font-size: 16px;
  color: var(--text);
  transition: transform 0.15s ease;
}
.expand-chevron.open {
  transform: rotate(180deg);
}
.card-divider {
  border-top: 1px solid var(--border);
}
.campaign-details {
  padding: 16px 20px 18px;
}
.detail-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 20px 32px;
  margin-bottom: 12px;
}
.detail-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.detail-stat span {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text);
}
.detail-stat strong {
  font-size: 16px;
  color: var(--text-h);
}
.progress-track {
  height: 6px;
  background: var(--code-bg);
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}
/*
 * --accent / --accent-bg / --accent-border are shared design tokens (defined in style.css
 * and used app-wide: nav, badges, dashboards). Rather than change them globally, this
 * re-declares the tokens on the page so only elements on My Campaigns inherit the brand red.
 * Sourced from the central --brand-red-* tokens (style.css), which already flip for dark mode.
 */
.page-theme-red {
  --accent: var(--brand-red);
  --accent-bg: var(--brand-red-bg);
  --accent-border: var(--brand-red-border);
}

@media (max-width: 640px) {
  .campaign-top {
    padding: 14px 16px;
  }
  .campaign-details {
    padding: 12px 16px 16px;
  }
  .toolbar {
    flex-wrap: wrap;
  }
  .filter-row {
    gap: 12px;
  }
}
</style>
