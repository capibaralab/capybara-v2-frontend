<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCampaignsStore } from '../stores/campaigns'
import { findInfluencerById } from '../services/mockInfluencers'
import { getEngagedInfluencerBreakdown } from '../services/api'
import { generateProductPlaceholder } from '../services/avatar'
import { SEGMENT_OPTIONS } from '../services/constants'
import { formatCompactNumber, formatCurrency } from '../utils/format'
import StatCard from '../components/StatCard.vue'

const route = useRoute()
const campaignsStore = useCampaignsStore()

onMounted(() => {
  campaignsStore.fetchAll()
})

const influencer = computed(() => findInfluencerById(route.params.id))

const rows = computed(() => {
  if (!influencer.value) return []
  return getEngagedInfluencerBreakdown(campaignsStore.campaigns)
    .filter((row) => row.influencerId === influencer.value.id)
    .map((row) => {
      const campaign = campaignsStore.campaigns.find((c) => c.id === row.campaignId)
      return {
        ...row,
        companyName: campaign?.companyName ?? '',
        productImage: campaign?.product?.imageDataUrl ?? '',
      }
    })
})

const segmentLabels = computed(() => {
  if (!influencer.value) return ''
  const byValue = Object.fromEntries(SEGMENT_OPTIONS.map((opt) => [opt.value, opt.label]))
  return influencer.value.segments.map((value) => byValue[value] ?? value).join(', ')
})

function average(values) {
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0
}
const avgStats = computed(() => ({
  views: average(rows.value.map((row) => row.views)),
  clicks: average(rows.value.map((row) => row.clicks)),
  ctr: average(rows.value.map((row) => row.ctr)),
  profit: average(rows.value.map((row) => row.budgetSpent)),
}))

const brands = computed(() => {
  const names = [...new Set(rows.value.map((row) => row.companyName))].filter(Boolean)
  return names.map((name) => ({ name, logo: generateProductPlaceholder(name) }))
})
</script>

<template>
  <main class="container portfolio">
    <RouterLink to="/advertiser/influencers-engaged" class="back-link">← Back to Influencers</RouterLink>

    <template v-if="influencer">
      <section class="profile-header">
        <img :src="influencer.avatarUrl" :alt="influencer.name" class="profile-pic" />
        <div class="profile-info">
          <strong>{{ influencer.name }}</strong>
          <a
            :href="`https://instagram.com/${influencer.handle.replace(/^@/, '')}`"
            target="_blank"
            rel="noopener noreferrer"
            class="instagram-link"
          >
            {{ influencer.handle }}
          </a>
          <span class="followers">{{ formatCompactNumber(influencer.followers) }} followers</span>
        </div>
      </section>

      <section class="portfolio-section card">
        <h2>Audience Summary</h2>
        <div class="field-row">
          <span class="field-label">Segment</span>
          <span class="field-value">{{ segmentLabels || '—' }}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Categories</span>
          <span class="field-value">{{ influencer.categories.join(', ') || '—' }}</span>
        </div>
      </section>

      <section class="portfolio-section">
        <h2>Average Results</h2>
        <p v-if="!rows.length" class="hint">No collaborations yet.</p>
        <div v-else class="stat-grid">
          <StatCard icon="impressions" :value="formatCompactNumber(avgStats.views)" label="Avg Views" />
          <StatCard icon="clicks" :value="formatCompactNumber(avgStats.clicks)" label="Avg Clicks" />
          <StatCard icon="engagement" :value="`${avgStats.ctr.toFixed(1)}%`" label="Avg CTR" />
          <StatCard icon="budget" :value="formatCurrency(avgStats.profit)" label="Avg Profit" />
        </div>
      </section>

      <section class="portfolio-section">
        <h2>Brands Worked With</h2>
        <p v-if="!brands.length" class="hint">No collaborations yet.</p>
        <div v-else class="brand-grid">
          <div v-for="brand in brands" :key="brand.name" class="brand-tile">
            <img :src="brand.logo" :alt="brand.name" class="brand-logo" />
            <span>{{ brand.name }}</span>
          </div>
        </div>
      </section>
    </template>
    <p v-else class="hint">Influencer not found.</p>
  </main>
</template>

<style scoped>
.portfolio {
  position: relative;
  padding-top: 16px;
}
/* .portfolio shares .container's max-width:900px, so a plain background would only color
   that centered column — this pseudo-element covers the full viewport behind it instead. */
.portfolio::before {
  content: '';
  position: fixed;
  inset: 0;
  background: #f6fffe;
  z-index: -1;
}
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
.hint {
  color: var(--text);
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 8px 0 32px;
}
.profile-pic {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.profile-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.profile-info strong {
  font-size: 17px;
  color: var(--text-h);
}
.instagram-link {
  font-size: 14px;
  color: var(--brand-red);
  text-decoration: none;
}
.instagram-link:hover {
  text-decoration: underline;
}
.followers {
  font-size: 13px;
  color: var(--text);
}
.portfolio-section {
  margin-bottom: 32px;
}
.portfolio-section h2 {
  margin: 0 0 12px;
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
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}
.brand-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 16px;
}
.brand-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}
.brand-logo {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid var(--border);
}
.brand-tile span {
  font-size: 12px;
  color: var(--text);
}
</style>
