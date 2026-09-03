<script setup>
import { computed, onMounted, ref } from 'vue'
import { listLiveCollaborations, listCompletedCollaborations } from '../services/api'
import { formatCurrency } from '../utils/format'
import StatCard from '../components/StatCard.vue'
import SelectDropdown from '../components/SelectDropdown.vue'

const live = ref([])
const completed = ref([])
const loading = ref(true)

onMounted(async () => {
  const [l, c] = await Promise.all([listLiveCollaborations(), listCompletedCollaborations()])
  live.value = l
  completed.value = c
  loading.value = false
})

const rows = computed(() => [...live.value, ...completed.value])

const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'status', label: 'Status' },
  { value: 'highest', label: 'Highest to lowest' },
  { value: 'lowest', label: 'Lowest to highest' },
  { value: 'brand', label: 'Brand' },
]
const sortBy = ref('date')

const sortedRows = computed(() => {
  const list = [...rows.value]
  switch (sortBy.value) {
    case 'status':
      return list.sort((a, b) => a.status.localeCompare(b.status))
    case 'highest':
      return list.sort((a, b) => b.budgetSpent - a.budgetSpent)
    case 'lowest':
      return list.sort((a, b) => a.budgetSpent - b.budgetSpent)
    case 'brand':
      return list.sort((a, b) => a.companyName.localeCompare(b.companyName))
    case 'date':
    default:
      return list.sort((a, b) => new Date(b.respondedAt || b.sentAt) - new Date(a.respondedAt || a.sentAt))
  }
})

// Live collaborations' profit accrues over their run so far — today's slice is estimated
// as a ~30-day daily average rather than the full running total.
const todaysProfit = computed(() =>
  Math.round(live.value.reduce((sum, row) => sum + row.budgetSpent, 0) / 30)
)
const totalProfit = computed(() => rows.value.reduce((sum, row) => sum + row.budgetSpent, 0))
</script>

<template>
  <main class="container profit">
    <RouterLink to="/influencer" class="back-link">← Back to Home</RouterLink>
    <h1>Profit</h1>
    <p class="hint">Your earnings across every collaboration, live and completed.</p>

    <div class="stat-grid">
      <StatCard icon="budget" :value="formatCurrency(todaysProfit)" label="Today's Profit" />
      <StatCard icon="budget" :value="formatCurrency(totalProfit)" label="Total Profit" />
    </div>

    <div class="section-header">
      <h2>Breakdown by Collaboration</h2>
      <label class="filter-inline">
        <span class="filter-label">Sort by</span>
        <SelectDropdown v-model="sortBy" :options="SORT_OPTIONS" />
      </label>
    </div>
    <div v-if="loading">Loading…</div>
    <p v-else-if="!rows.length" class="hint">No collaborations yet.</p>

    <ul v-else class="profit-list">
      <li v-for="row in sortedRows" :key="row.offerId" class="card profit-row">
        <img :src="row.productImage" alt="" class="product-thumb" />
        <div class="details">
          <strong>{{ row.companyName }}</strong>
          <span class="sub">{{ row.campaignName }}</span>
        </div>
        <span class="badge" :class="`badge-${row.status}`">{{ row.status }}</span>
        <strong class="profit-value">{{ formatCurrency(row.budgetSpent) }}</strong>
      </li>
    </ul>
  </main>
</template>

<style scoped>
/* --accent / --accent-bg / --accent-border are shared design tokens (defined in style.css
   and used app-wide). Rather than change them globally, this re-declares the tokens on the
   page so only elements here inherit the brand red. Sourced from the central --brand-red-*
   tokens (style.css), which already flip for dark mode. */
.profit {
  --accent: var(--brand-red);
  --accent-bg: var(--brand-red-bg);
  --accent-border: var(--brand-red-border);
  position: relative;
  padding-top: 16px;
}
/* .profit shares .container's max-width:900px, so a plain background would only color that
   centered column — this pseudo-element covers the full viewport behind it instead. */
.profit::before {
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
  margin: 4px 0 24px;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 32px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.section-header h2 {
  margin: 0;
}
.filter-inline {
  display: flex;
  align-items: center;
  gap: 8px;
}
/* The trigger sits flush against the container's right edge, so the shared dropdown's
   default left-aligned panel would overflow past the viewport on narrow screens. */
.filter-inline :deep(.select-panel) {
  left: auto;
  right: 0;
}
.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-h);
  white-space: nowrap;
}
.profit-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.profit-row {
  display: flex;
  align-items: center;
  gap: 16px;
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
.profit-value {
  font-size: 15px;
  color: var(--text-h);
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .profit-row {
    flex-wrap: wrap;
  }
  .details {
    flex-basis: calc(100% - 72px);
  }
}
</style>
