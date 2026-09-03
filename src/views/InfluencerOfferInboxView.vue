<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { listPendingOffers } from '../services/api'
import { useCampaignsStore } from '../stores/campaigns'
import { formatCompactNumber } from '../utils/format'

const route = useRoute()
const campaignsStore = useCampaignsStore()
const offers = ref([])
const loading = ref(true)
const respondingId = ref(null)

const backTarget = computed(() =>
  route.query.from === 'collaborations'
    ? { to: '/influencer/collaborations', label: 'Collaborations' }
    : { to: '/influencer', label: 'Home' },
)

async function refresh() {
  loading.value = true
  offers.value = await listPendingOffers()
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
  <main class="container influencer-inbox">
    <RouterLink :to="backTarget.to" class="back-link">← Back to {{ backTarget.label }}</RouterLink>
    <h1>New Suggestions</h1>
    <p class="hint">
      Stand-in for the influencer side of the app — no login yet, so every pending collaboration
      offer across all campaigns shows up here.
    </p>

    <div v-if="loading">Loading offers…</div>
    <p v-else-if="!offers.length" class="hint">No pending offers right now.</p>

    <ul v-else class="offer-list">
      <li v-for="offer in offers" :key="offer.offerId" class="card offer-row">
        <RouterLink
          :to="{ path: `/influencer/campaigns/${offer.campaignId}/${offer.offerId}`, query: { from: 'offers' } }"
          class="offer-row-link"
        >
          <img :src="offer.influencer?.avatarUrl" alt="" class="avatar" />
          <div class="details">
            <strong>{{ offer.influencer?.name }}</strong>
            <span class="handle">{{ offer.influencer?.handle }}</span>
            <div class="meta">
              Collaboration offer from <strong>{{ offer.companyName }}</strong> ·
              {{ formatCompactNumber(offer.influencer?.followers ?? 0) }} followers
            </div>
          </div>
        </RouterLink>
        <div class="actions">
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            :disabled="respondingId === offer.offerId"
            @click="respond(offer.offerId, 'declined')"
          >
            Decline
          </button>
          <button
            type="button"
            class="btn btn-primary btn-sm"
            :disabled="respondingId === offer.offerId"
            @click="respond(offer.offerId, 'approved')"
          >
            {{ respondingId === offer.offerId ? 'Saving…' : 'Approve' }}
          </button>
        </div>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.influencer-inbox :deep(.btn-primary) {
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
.offer-list {
  list-style: none;
  margin: 24px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.offer-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.offer-row-link {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
  text-decoration: none;
  color: inherit;
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}
.details {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.handle {
  color: var(--text);
  font-size: 14px;
}
.meta {
  font-size: 13px;
  color: var(--text);
  margin-top: 4px;
}
.actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .offer-row {
    flex-wrap: wrap;
  }
  .details {
    min-width: 0;
    flex-basis: calc(100% - 64px);
  }
  .actions {
    width: 100%;
  }
  .actions .btn {
    flex: 1;
  }
}
</style>
