<script setup>
import { computed, onMounted, ref } from 'vue'
import logo from '../assets/logo.png'
import CreateCampaignButton from '../components/CreateCampaignButton.vue'
import CampaignFormModal from '../components/campaign-form/CampaignFormModal.vue'
import BarChart from '../components/BarChart.vue'
import ClicksCtrChart from '../components/ClicksCtrChart.vue'
import StatCard from '../components/StatCard.vue'
import DatePickerField from '../components/DatePickerField.vue'
import { useCampaignsStore } from '../stores/campaigns'
import { useAdvertiserProfileStore } from '../stores/advertiserProfile'
import { MOCK_INFLUENCERS } from '../services/mockInfluencers'
import { getEngagedInfluencerBreakdown } from '../services/api'
import { formatCompactNumber, formatCurrency } from '../utils/format'

const campaignsStore = useCampaignsStore()
const profile = useAdvertiserProfileStore()
const showCollabModal = ref(false)
const collabInfluencerUrl = ref('')

function openCollabModal(influencer) {
  collabInfluencerUrl.value = `https://instagram.com/${influencer.handle.replace(/^@/, '')}`
  showCollabModal.value = true
}

onMounted(() => {
  campaignsStore.fetchAll()
})

const liveCampaigns = computed(() => campaignsStore.campaigns.filter((campaign) => campaign.status === 'live'))
const hasAnyCampaigns = computed(() => campaignsStore.campaigns.length > 0)

const RANGE_PRESETS = [
  { value: 'all', label: 'All time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom range' },
]
const rangeMode = ref('all')
const customStart = ref('')
const customEnd = ref('')

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris / Berlin' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem' },
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Asia/Kolkata', label: 'Mumbai / Delhi' },
  { value: 'Asia/Shanghai', label: 'Shanghai / Singapore' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' },
]

function detectBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

const browserTz = detectBrowserTimezone()
const timezoneOptions = TIMEZONE_OPTIONS.some((opt) => opt.value === browserTz)
  ? TIMEZONE_OPTIONS
  : [{ value: browserTz, label: `${browserTz} (detected)` }, ...TIMEZONE_OPTIONS]
const timezone = ref(browserTz)

function todayInTimezone(tz) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(
    new Date(),
  )
  const get = (type) => parts.find((p) => p.type === type).value
  return `${get('year')}-${get('month')}-${get('day')}`
}

function addDaysIso(isoDateStr, n) {
  const [y, m, d] = isoDateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + n)
  const yy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

const effectiveRange = computed(() => {
  if (rangeMode.value === 'all') return { start: null, end: null }
  const todayIso = todayInTimezone(timezone.value)
  if (rangeMode.value === '7d') return { start: addDaysIso(todayIso, -6), end: todayIso }
  if (rangeMode.value === '30d') return { start: addDaysIso(todayIso, -29), end: todayIso }
  if (customStart.value && customEnd.value) return { start: customStart.value, end: customEnd.value }
  return { start: null, end: null }
})

function isWithinRange(dateStr, range) {
  if (!range.start || !range.end) return true
  return dateStr >= range.start && dateStr <= range.end
}

function filteredCampaignMetrics(campaign) {
  const range = effectiveRange.value
  const rows = (campaign.dailyMetrics ?? []).filter((row) => isWithinRange(row.date, range))
  return {
    impressions: rows.reduce((sum, row) => sum + row.impressions, 0),
    budgetSpent: rows.reduce((sum, row) => sum + row.budgetSpent, 0),
    engagementRate: rows.length ? rows.reduce((sum, row) => sum + row.engagementRate, 0) / rows.length : 0,
    hasActivity: rows.length > 0,
  }
}

const liveStats = computed(() => {
  const list = liveCampaigns.value
  const perCampaign = list.map((campaign) => filteredCampaignMetrics(campaign))
  const withActivity = perCampaign.filter((c) => c.hasActivity)
  const influencerIds = new Set()
  list.forEach((campaign) => campaign.selectedInfluencerIds.forEach((id) => influencerIds.add(id)))
  const engagedRows = getEngagedInfluencerBreakdown(list)

  return {
    activeCampaigns: list.length,
    totalImpressions: perCampaign.reduce((sum, c) => sum + c.impressions, 0),
    avgEngagementRate: withActivity.length
      ? withActivity.reduce((sum, c) => sum + c.engagementRate, 0) / withActivity.length
      : 0,
    totalBudgetSpent: perCampaign.reduce((sum, c) => sum + c.budgetSpent, 0),
    totalInfluencers: influencerIds.size,
    avgCtr: engagedRows.length ? engagedRows.reduce((sum, r) => sum + r.ctr, 0) / engagedRows.length : 0,
    totalClicks: engagedRows.reduce((sum, r) => sum + r.clicks, 0),
  }
})

const impressionsChartData = computed(() =>
  liveCampaigns.value.map((campaign) => ({
    label: campaign.campaignName || campaign.companyName,
    value: filteredCampaignMetrics(campaign).impressions,
  })),
)
const budgetChartData = computed(() =>
  liveCampaigns.value.map((campaign) => ({
    label: campaign.campaignName || campaign.companyName,
    value: filteredCampaignMetrics(campaign).budgetSpent,
  })),
)

const clicksAndCtrData = computed(() => {
  const byCampaign = new Map()
  getEngagedInfluencerBreakdown(liveCampaigns.value).forEach((row) => {
    const entry = byCampaign.get(row.campaignId) || { label: row.campaignName, clicks: 0, views: 0 }
    entry.clicks += row.clicks
    entry.views += row.views
    byCampaign.set(row.campaignId, entry)
  })
  return [...byCampaign.values()].map((c) => ({
    label: c.label,
    clicks: c.clicks,
    ctr: c.views ? (c.clicks / c.views) * 100 : 0,
  }))
})

const topInfluencers = computed(() => {
  const categories = profile.categories
  return [...MOCK_INFLUENCERS]
    .map((influencer) => ({
      ...influencer,
      overlap: categories.length ? influencer.categories.filter((c) => categories.includes(c)).length : 0,
    }))
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 6)
})
</script>

<template>
  <main class="container home">
    <img :src="logo" alt="Capybara Lab AI logo" class="logo" />
    <h1>Capybara</h1>
    <p class="tagline">
      A marketplace pairing brands with the right-fit influencers,<br />
      blending your product into their content.
    </p>
    <CreateCampaignButton button-class="btn btn-primary btn-create cta-button" />

    <section v-if="hasAnyCampaigns" class="live-dashboard-section">
      <div class="section-header">
        <h2>Live Campaigns</h2>
        <RouterLink to="/advertiser" class="my-campaigns-link">My Campaigns</RouterLink>
      </div>

      <div v-if="!liveCampaigns.length" class="card empty-state">
        <p>No live campaigns yet — once one of your campaigns goes live, its performance shows up here.</p>
      </div>

      <template v-else>
        <div class="stat-grid">
          <RouterLink to="/advertiser?status=live" class="stat-card-link">
            <StatCard icon="campaigns" :value="liveStats.activeCampaigns" label="Active Campaigns" />
          </RouterLink>
          <RouterLink to="/advertiser/influencers-engaged" class="stat-card-link">
            <StatCard icon="influencers" :value="liveStats.totalInfluencers" label="Influencers Engaged" />
          </RouterLink>
          <StatCard icon="engagement" :value="`${liveStats.avgCtr.toFixed(1)}%`" label="CTR's" />
          <StatCard icon="clicks" :value="formatCompactNumber(liveStats.totalClicks)" label="Clicks" />
        </div>

        <div class="filter-row">
          <label class="filter-inline">
            <span class="filter-label">Date range</span>
            <select v-model="rangeMode">
              <option v-for="preset in RANGE_PRESETS" :key="preset.value" :value="preset.value">{{ preset.label }}</option>
            </select>
          </label>
          <div v-if="rangeMode === 'custom'" class="custom-range">
            <DatePickerField v-model="customStart" id="dashboard-range-start" />
            <span class="range-sep">–</span>
            <DatePickerField v-model="customEnd" id="dashboard-range-end" />
          </div>
          <label class="filter-inline">
            <span class="filter-label">Time zone</span>
            <select v-model="timezone">
              <option v-for="tz in timezoneOptions" :key="tz.value" :value="tz.value">{{ tz.label }}</option>
            </select>
          </label>
        </div>

        <div class="chart-card card">
          <h3>Views ({{ formatCompactNumber(liveStats.totalImpressions) }})</h3>
          <BarChart :items="impressionsChartData" :format-value="formatCompactNumber" />
        </div>

        <div class="chart-card card">
          <h3>Budget Spent ({{ formatCurrency(liveStats.totalBudgetSpent) }})</h3>
          <BarChart :items="budgetChartData" :format-value="formatCurrency" />
        </div>

        <div class="chart-card card">
          <h3>Clicks & CTR</h3>
          <ClicksCtrChart :items="clicksAndCtrData" />
        </div>
      </template>
    </section>

    <section class="top-influencers-section">
      <h2>Influencers with your audience</h2>
      <ul class="influencer-teaser-row">
        <li
          v-for="influencer in topInfluencers"
          :key="influencer.id"
          class="teaser-item"
          role="button"
          tabindex="0"
          @click="openCollabModal(influencer)"
          @keydown.enter="openCollabModal(influencer)"
        >
          <div class="teaser-avatar-wrap">
            <img :src="influencer.avatarUrl" :alt="influencer.name" class="teaser-avatar" />
            <span class="teaser-followers">{{ formatCompactNumber(influencer.followers) }} followers</span>
          </div>
          <button type="button" class="teaser-collab-btn" @click.stop="openCollabModal(influencer)">
            Collaborate
          </button>
        </li>
      </ul>

      <div v-if="hasAnyCampaigns" class="teaser-create-btn">
        <CreateCampaignButton button-class="btn btn-primary btn-create cta-button" />
      </div>
    </section>

    <CampaignFormModal
      v-if="showCollabModal"
      :preferred-influencer-url="collabInfluencerUrl"
      @close="showCollabModal = false"
    />
  </main>
</template>

<style scoped>
.home {
  position: relative;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 96px;
}
/* .home shares .container's max-width:900px, so a plain background would only color that
   centered column — this pseudo-element covers the full viewport behind it instead. */
.home::before {
  content: '';
  position: fixed;
  inset: 0;
  background: #f6fffe;
  z-index: -1;
}
.logo {
  width: 128px;
  height: auto;
  margin-bottom: 16px;
}
.home h1 {
  font-family: 'Nunito', var(--heading);
}
.tagline {
  max-width: 480px;
  margin: 16px 0 64px;
  font-size: 17px;
  line-height: 1.5;
}
.live-dashboard-section {
  width: 100%;
  max-width: 720px;
  margin-top: 64px;
  text-align: left;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-header h2 {
  margin: 0;
}
.my-campaigns-link {
  font-size: 14px;
  font-weight: 600;
  color: var(--brand-red);
  text-decoration: none;
}
.my-campaigns-link:hover {
  text-decoration: underline;
}
.empty-state {
  text-align: center;
  color: var(--text);
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.stat-card-link {
  display: block;
  color: inherit;
  text-decoration: none;
  border-radius: 12px;
  transition: box-shadow 0.15s;
}
.stat-card-link:hover {
  box-shadow: var(--shadow);
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
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
.filter-inline select {
  width: auto;
  padding: 8px 10px;
  font-size: 14px;
}
.custom-range {
  display: flex;
  align-items: center;
  gap: 8px;
}
.custom-range .date-picker {
  width: 150px;
}
.range-sep {
  color: var(--text);
}

.chart-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  margin-bottom: 16px;
}
.chart-card h3 {
  margin: 0 0 16px;
  font-size: 14px;
}
.top-influencers-section {
  width: 100%;
  max-width: 720px;
  margin-top: 48px;
  text-align: left;
}
.teaser-create-btn {
  text-align: center;
  margin-top: 32px;
}
.influencer-teaser-row {
  list-style: none;
  margin: 16px 0 0;
  padding: 4px 0 8px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  justify-items: center;
}
.teaser-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border-radius: 12px;
}
.teaser-item:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.teaser-avatar-wrap {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
}
.teaser-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}
.teaser-followers {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 50%);
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 1px 7px;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-h);
  white-space: nowrap;
  line-height: 1.4;
}
.teaser-collab-btn {
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  color: var(--brand-red);
  background: none;
  border: none;
  border-radius: 999px;
  padding: 2px 9px;
  cursor: pointer;
}
.teaser-collab-btn:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .home {
    padding-top: 56px;
  }
  .tagline {
    margin: 12px 0 40px;
    font-size: 15px;
  }
  .live-dashboard-section,
  .top-influencers-section {
    margin-top: 40px;
  }
  .section-header {
    flex-wrap: wrap;
    gap: 8px;
  }
  .custom-range {
    flex-wrap: wrap;
  }
  .custom-range .date-picker {
    width: 140px;
  }
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .influencer-teaser-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .teaser-avatar-wrap {
    width: 48px;
    height: 48px;
  }
  .teaser-avatar {
    width: 48px;
    height: 48px;
  }
  .teaser-followers {
    font-size: 9px;
    padding: 1px 5px;
  }
  .teaser-item {
    gap: 10px;
  }
  .teaser-collab-btn {
    font-size: 10px;
    padding: 2px 7px;
  }
}
</style>
