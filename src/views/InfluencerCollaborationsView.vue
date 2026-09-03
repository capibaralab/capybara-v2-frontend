<script setup>
import { onMounted, ref } from 'vue'
import { listPendingOffers, listLiveCollaborations, listCompletedCollaborations } from '../services/api'
import { useCampaignsStore } from '../stores/campaigns'
import { formatCompactNumber, formatCurrency } from '../utils/format'

const campaignsStore = useCampaignsStore()
const loading = ref(true)
const suggestions = ref([])
const live = ref([])
const completed = ref([])
const respondingId = ref(null)

async function refresh() {
  const [s, l, c] = await Promise.all([listPendingOffers(), listLiveCollaborations(), listCompletedCollaborations()])
  suggestions.value = s
  live.value = l
  completed.value = c
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
</script>

<template>
  <main class="container influencer-home">
    <RouterLink to="/influencer" class="back-link">← Back to Home</RouterLink>
    <h1>Collaborations</h1>
    <p class="tagline">Every brand collaboration in one place — new offers, live placements, and past work.</p>

    <section class="strip-section">
      <div class="strip-header">
        <h2>New Suggestions</h2>
        <RouterLink
          :to="{ path: '/influencer/offers', query: { from: 'collaborations' } }"
          class="see-all-link"
        >
          See all →
        </RouterLink>
      </div>
      <p v-if="!loading && !suggestions.length" class="hint">No new suggestions right now.</p>
      <div v-else class="strip-row">
        <div v-for="item in suggestions.slice(0, 6)" :key="item.offerId" class="strip-card">
          <RouterLink :to="`/influencer/campaigns/${item.campaignId}/${item.offerId}`" class="strip-card-link">
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

    <section class="strip-section">
      <div class="strip-header">
        <h2>Live Collaborations</h2>
        <RouterLink
          :to="{ path: '/influencer/collaborations/live', query: { from: 'collaborations' } }"
          class="see-all-link"
        >
          See all →
        </RouterLink>
      </div>
      <p v-if="!loading && !live.length" class="hint">No live collaborations yet.</p>
      <div v-else class="strip-row">
        <RouterLink
          v-for="item in live.slice(0, 6)"
          :key="item.offerId"
          :to="`/influencer/campaigns/${item.campaignId}/${item.offerId}`"
          class="strip-card"
        >
          <img :src="item.productImage" alt="" class="strip-card-image" />
          <div class="strip-card-body">
            <strong>{{ item.companyName }}</strong>
            <span class="strip-card-sub">{{ item.campaignName }}</span>
            <span class="strip-card-stats">{{ formatCompactNumber(item.views) }} views · {{ item.ctr.toFixed(1) }}% CTR</span>
            <span class="strip-card-profit">{{ formatCurrency(item.budgetSpent) }} profit</span>
          </div>
        </RouterLink>
      </div>
    </section>

    <section class="strip-section">
      <div class="strip-header">
        <h2>Completed</h2>
        <RouterLink to="/influencer/collaborations/completed" class="see-all-link">See all →</RouterLink>
      </div>
      <p v-if="!loading && !completed.length" class="hint">No completed collaborations yet.</p>
      <div v-else class="strip-row">
        <RouterLink
          v-for="item in completed.slice(0, 6)"
          :key="item.offerId"
          :to="`/influencer/campaigns/${item.campaignId}/${item.offerId}`"
          class="strip-card"
        >
          <img :src="item.productImage" alt="" class="strip-card-image" />
          <div class="strip-card-body">
            <strong>{{ item.companyName }}</strong>
            <span class="strip-card-sub">{{ item.campaignName }}</span>
            <span class="strip-card-stats">{{ formatCompactNumber(item.views) }} views · {{ item.ctr.toFixed(1) }}% CTR</span>
            <span class="strip-card-profit">{{ formatCurrency(item.budgetSpent) }} profit</span>
          </div>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.influencer-home {
  position: relative;
  padding-top: 48px;
}
/* .influencer-home shares .container's max-width:900px, so a plain background would only
   color that centered column — this pseudo-element covers the full viewport behind it. */
.influencer-home::before {
  content: '';
  position: fixed;
  inset: 0;
  background: #f6fffe;
  z-index: -1;
}
.influencer-home :deep(.btn-primary) {
  background: var(--brand-red);
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
.tagline {
  color: var(--text);
  margin: 4px 0 40px;
}
.strip-section {
  margin-bottom: 40px;
}
.strip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.strip-header h2 {
  margin: 0;
}
.see-all-link {
  font-size: 14px;
  font-weight: 600;
  color: var(--brand-red);
  text-decoration: none;
  white-space: nowrap;
}
.see-all-link:hover {
  text-decoration: underline;
}
.hint {
  color: var(--text);
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
  text-decoration: none;
  color: inherit;
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
.strip-card-stats {
  font-size: 12px;
  color: var(--text);
  margin-top: 2px;
}
.strip-card-profit {
  font-size: 12px;
  font-weight: 600;
  color: var(--brand-teal-ink);
}
@media (max-width: 640px) {
  .influencer-home {
    padding-top: 32px;
  }
  .strip-card {
    flex-basis: 180px;
  }
}
</style>
