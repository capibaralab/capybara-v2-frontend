<script setup>
import { computed, onMounted, ref } from 'vue'
import logo from '../assets/logo.png'
import { listPendingOffers, listLiveCollaborations } from '../services/api'
import { useCampaignsStore } from '../stores/campaigns'
import { formatCompactNumber, formatCurrency } from '../utils/format'
import StatCard from '../components/StatCard.vue'
import InviteBrandModal from '../components/InviteBrandModal.vue'

const campaignsStore = useCampaignsStore()
const loading = ref(true)
const suggestions = ref([])
const live = ref([])
const respondingId = ref(null)
const showInviteBrand = ref(false)

async function refresh() {
  const [s, l] = await Promise.all([listPendingOffers(), listLiveCollaborations()])
  suggestions.value = s
  live.value = l
  loading.value = false
}

async function respond(offerId, decision) {
  respondingId.value = offerId
  try {
    await campaignsStore.respondToOffer(offerId, decision)
    await refresh()
  } finally {
    respondingId.value = null
  }
}

onMounted(refresh)

const liveStats = computed(() => ({
  count: live.value.length,
  totalViews: live.value.reduce((sum, row) => sum + row.views, 0),
  totalClicks: live.value.reduce((sum, row) => sum + row.clicks, 0),
  avgCtr: live.value.length ? live.value.reduce((sum, row) => sum + row.ctr, 0) / live.value.length : 0,
}))

// Live collaborations' profit accrues over their run so far — today's slice is estimated
// as a ~30-day daily average rather than the full running total.
const todaysProfit = computed(() =>
  Math.round(live.value.reduce((sum, row) => sum + row.budgetSpent, 0) / 30)
)
</script>

<template>
  <main class="container home">
    <img :src="logo" alt="Capybara Lab AI logo" class="logo" />
    <h1>Capybara</h1>
    <p class="tagline">
      Every brand collaboration in one place — new offers, live<br />
      placements, and past work.
    </p>
    <button type="button" class="btn btn-primary btn-create cta-button" @click="showInviteBrand = true">
      Invite Brands to Collaborate
    </button>

    <section class="live-dashboard-section today-section">
      <div class="section-header">
        <h2>Today's Profit</h2>
        <RouterLink to="/influencer/profit" class="my-campaigns-link">See all</RouterLink>
      </div>
      <StatCard icon="budget" :value="formatCurrency(todaysProfit)" label="Estimated earnings today" />
    </section>

    <section class="live-dashboard-section">
      <div class="section-header">
        <h2>Live Collaborations</h2>
        <RouterLink
          :to="{ path: '/influencer/collaborations/live', query: { from: 'home' } }"
          class="my-campaigns-link"
        >
          See all
        </RouterLink>
      </div>

      <div v-if="!loading && !live.length" class="card empty-state">
        <p>No live collaborations yet — once a brand approves you, it shows up here.</p>
      </div>

      <div v-else class="stat-grid">
        <StatCard icon="campaigns" :value="liveStats.count" label="Live Collaborations" />
        <StatCard icon="impressions" :value="formatCompactNumber(liveStats.totalViews)" label="Views" />
        <StatCard icon="clicks" :value="formatCompactNumber(liveStats.totalClicks)" label="Clicks" />
        <StatCard icon="engagement" :value="`${liveStats.avgCtr.toFixed(1)}%`" label="Avg CTR" />
      </div>
    </section>

    <section class="live-dashboard-section">
      <div class="section-header">
        <h2>Suggested Collaborations</h2>
        <RouterLink :to="{ path: '/influencer/offers', query: { from: 'home' } }" class="my-campaigns-link">
          See all
        </RouterLink>
      </div>

      <p v-if="!loading && !suggestions.length" class="hint">No new suggestions right now.</p>
      <div v-else class="strip-row">
        <div v-for="item in suggestions.slice(0, 6)" :key="item.offerId" class="strip-card">
          <RouterLink :to="{ path: '/influencer/offers', query: { from: 'home' } }" class="strip-card-link">
            <img :src="item.productImage" alt="" class="strip-card-image" />
            <div class="strip-card-body">
              <strong>{{ item.companyName }}</strong>
              <span class="strip-card-sub">{{ item.campaignName }}</span>
            </div>
          </RouterLink>
          <div class="suggestion-actions">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              :disabled="respondingId === item.offerId"
              @click="respond(item.offerId, 'declined')"
            >
              Decline
            </button>
            <button
              type="button"
              class="btn btn-primary btn-sm"
              :disabled="respondingId === item.offerId"
              @click="respond(item.offerId, 'approved')"
            >
              {{ respondingId === item.offerId ? 'Saving…' : 'Approve' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="live-dashboard-section portfolio-section">
      <RouterLink to="/influencer/portfolio" class="my-campaigns-link">My Portfolio →</RouterLink>
    </section>

    <InviteBrandModal v-if="showInviteBrand" @close="showInviteBrand = false" />
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
.home :deep(.btn-primary) {
  background: var(--brand-red);
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
.portfolio-section {
  margin-top: 32px;
  text-align: center;
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
.hint {
  color: var(--text);
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}
.today-section :deep(.stat-card) {
  max-width: 240px;
}
.strip-row {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
}
.strip-card {
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-raised);
  transition: box-shadow 0.15s;
}
.strip-card:hover {
  box-shadow: var(--shadow);
}
.strip-card-link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
}
.suggestion-actions {
  display: flex;
  gap: 8px;
  padding: 0 12px 12px;
}
.suggestion-actions .btn {
  flex: 1;
}
.strip-card-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  background: var(--code-bg);
}
.strip-card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
}
.strip-card-body strong {
  font-size: 14px;
  color: var(--text-h);
}
.strip-card-sub {
  font-size: 13px;
  color: var(--text);
}

@media (max-width: 640px) {
  .home {
    padding-top: 56px;
  }
  .tagline {
    margin: 12px 0 40px;
    font-size: 15px;
  }
  .live-dashboard-section {
    margin-top: 40px;
  }
  .section-header {
    flex-wrap: wrap;
    gap: 8px;
  }
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .strip-card {
    flex-basis: 180px;
  }
}
</style>
