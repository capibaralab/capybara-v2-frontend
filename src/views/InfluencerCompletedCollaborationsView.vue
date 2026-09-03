<script setup>
import { onMounted, ref } from 'vue'
import { listCompletedCollaborations } from '../services/api'
import { formatCompactNumber, formatCurrency } from '../utils/format'

const rows = ref([])
const loading = ref(true)

onMounted(async () => {
  rows.value = await listCompletedCollaborations()
  loading.value = false
})
</script>

<template>
  <main class="container">
    <RouterLink to="/influencer/collaborations" class="back-link">← Back to Collaborations</RouterLink>
    <h1>Completed Collaborations</h1>
    <p class="hint">Your past brand partnerships and how they performed.</p>

    <div v-if="loading">Loading…</div>
    <p v-else-if="!rows.length" class="hint">No completed collaborations yet.</p>

    <ul v-else class="collab-list">
      <li v-for="row in rows" :key="row.offerId">
        <RouterLink
          :to="{ path: `/influencer/campaigns/${row.campaignId}/${row.offerId}`, query: { from: 'completed' } }"
          class="card collab-row"
        >
          <img :src="row.productImage" alt="" class="product-thumb" />
          <div class="details">
            <strong>{{ row.companyName }}</strong>
            <span class="sub">{{ row.campaignName }}</span>
          </div>
          <div class="stats">
            <div class="stat">
              <span>Views</span>
              <strong>{{ formatCompactNumber(row.views) }}</strong>
            </div>
            <div class="stat">
              <span>Clicks</span>
              <strong>{{ formatCompactNumber(row.clicks) }}</strong>
            </div>
            <div class="stat">
              <span>CTR</span>
              <strong>{{ row.ctr.toFixed(1) }}%</strong>
            </div>
            <div class="stat">
              <span>Profit</span>
              <strong>{{ formatCurrency(row.budgetSpent) }}</strong>
            </div>
          </div>
        </RouterLink>
      </li>
    </ul>
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
.hint {
  color: var(--text);
  margin: 4px 0 24px;
}
.collab-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.collab-row {
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  color: inherit;
}
.product-thumb {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--code-bg);
}
.details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.details strong {
  color: var(--text-h);
}
.sub {
  font-size: 14px;
  color: var(--text);
}
.stats {
  display: flex;
  gap: 24px;
  flex-shrink: 0;
}
.stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.stat span {
  font-size: 12px;
  color: var(--text);
}
.stat strong {
  font-size: 15px;
  color: var(--text-h);
}

@media (max-width: 640px) {
  .collab-row {
    flex-wrap: wrap;
  }
  .details {
    flex-basis: calc(100% - 72px);
  }
  .stats {
    width: 100%;
    justify-content: space-between;
    margin-top: 8px;
  }
  .stat {
    align-items: flex-start;
  }
}
</style>
