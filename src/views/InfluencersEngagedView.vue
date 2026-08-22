<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useCampaignsStore } from '../stores/campaigns'
import { getEngagedInfluencerBreakdown } from '../services/api'
import { findInfluencerById } from '../services/mockInfluencers'
import { formatCompactNumber } from '../utils/format'
import CampaignFormModal from '../components/campaign-form/CampaignFormModal.vue'
import InviteInfluencersModal from '../components/InviteInfluencersModal.vue'
import SelectDropdown from '../components/SelectDropdown.vue'

const SORT_OPTIONS = [
  { value: 'influencer', label: 'Influencer' },
  { value: 'views', label: 'Views' },
]

const campaignsStore = useCampaignsStore()
const searchQuery = ref('')
const influencerFilter = ref('all')
const campaignFilter = ref('all')
const sortKey = ref('views')
const sortDir = ref('desc')
const showFilters = ref(false)
const expandedRows = reactive({})
const showCollabModal = ref(false)
const collabInfluencerUrl = ref('')
const showInviteModal = ref(false)

function openCollabModal(influencer) {
  collabInfluencerUrl.value = `https://instagram.com/${influencer.handle.replace(/^@/, '')}`
  showCollabModal.value = true
}

onMounted(() => {
  campaignsStore.fetchAll()
})

// One row per (influencer, campaign) pairing, same as before.
const campaignRows = computed(() =>
  getEngagedInfluencerBreakdown(campaignsStore.campaigns)
    .map((row) => ({ ...row, influencer: findInfluencerById(row.influencerId) }))
    .filter((row) => row.influencer),
)

// Grouped into one entry per influencer, with their campaigns nested underneath for the
// expanded card view.
const allRows = computed(() => {
  const byInfluencer = new Map()
  campaignRows.value.forEach((row) => {
    const entry = byInfluencer.get(row.influencerId) || {
      influencerId: row.influencerId,
      influencer: row.influencer,
      campaigns: [],
      views: 0,
    }
    entry.campaigns.push({
      campaignId: row.campaignId,
      campaignName: row.campaignName,
      views: row.views,
    })
    entry.views += row.views
    byInfluencer.set(row.influencerId, entry)
  })
  return [...byInfluencer.values()]
})

const influencerOptions = computed(() => [
  { value: 'all', label: 'All influencers' },
  ...[...new Set(allRows.value.map((row) => row.influencer.name))].sort().map((name) => ({ value: name, label: name })),
])
const campaignOptions = computed(() => [
  { value: 'all', label: 'All campaigns' },
  ...[...new Set(campaignRows.value.map((row) => row.campaignName))].sort().map((name) => ({ value: name, label: name })),
])

function toggleExpand(influencerId) {
  expandedRows[influencerId] = !expandedRows[influencerId]
}

function sortValue(row, key) {
  if (key === 'influencer') return row.influencer.name
  return row[key]
}

const rows = computed(() => {
  let list = allRows.value
  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    list = list.filter(
      (row) =>
        row.influencer.name.toLowerCase().includes(query) ||
        row.campaigns.some((c) => c.campaignName.toLowerCase().includes(query)),
    )
  }
  if (influencerFilter.value !== 'all') {
    list = list.filter((row) => row.influencer.name === influencerFilter.value)
  }
  if (campaignFilter.value !== 'all') {
    list = list.filter((row) => row.campaigns.some((c) => c.campaignName === campaignFilter.value))
  }

  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...list].sort((a, b) => {
    const av = sortValue(a, sortKey.value)
    const bv = sortValue(b, sortKey.value)
    if (typeof av === 'string') return av.localeCompare(bv) * dir
    return (av - bv) * dir
  })
})
</script>

<template>
  <main class="container page">
    <RouterLink to="/" class="back-link">← Back to Dashboard</RouterLink>

    <div class="header-row">
      <h1>Influencers</h1>
      <button type="button" class="btn btn-primary btn-create" @click="showInviteModal = true">
        Invite
      </button>
    </div>
    <p class="hint">Performance for every influencer engaged in one of your campaigns.</p>

    <InviteInfluencersModal v-if="showInviteModal" @close="showInviteModal = false" />

    <div v-if="allRows.length" class="toolbar">
      <input v-model="searchQuery" type="text" class="search-input" placeholder="Search by campaign or influencer…" />
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
        <span class="filter-label">Influencer</span>
        <SelectDropdown v-model="influencerFilter" :options="influencerOptions" />
      </label>
      <label class="filter-inline">
        <span class="filter-label">Campaign</span>
        <SelectDropdown v-model="campaignFilter" :options="campaignOptions" />
      </label>
      <label class="filter-inline">
        <span class="filter-label">Sort by</span>
        <SelectDropdown v-model="sortKey" :options="SORT_OPTIONS" />
      </label>
      <button type="button" class="sort-dir-btn" @click="sortDir = sortDir === 'asc' ? 'desc' : 'asc'">
        {{ sortDir === 'asc' ? '▲ Asc' : '▼ Desc' }}
      </button>
    </div>

    <p v-if="!allRows.length" class="empty card">No engaged influencers yet — once a campaign has influencers attached, they show up here.</p>
    <p v-else-if="!rows.length" class="empty card">No rows match these filters.</p>

    <ul v-else class="engaged-list">
      <li v-for="row in rows" :key="row.influencerId" class="engaged-card card">
        <button type="button" class="card-top" @click="toggleExpand(row.influencerId)">
          <img :src="row.influencer.avatarUrl" :alt="row.influencer.name" class="avatar" />
          <div class="identity">
            <div class="name-row">
              <span class="name">{{ row.influencer.name }}</span>
              <a
                :href="`https://instagram.com/${row.influencer.handle.replace(/^@/, '')}`"
                target="_blank"
                rel="noopener noreferrer"
                class="handle"
                @click.stop
              >
                {{ row.influencer.handle }}
              </a>
            </div>
            <div class="followers">{{ formatCompactNumber(row.influencer.followers) }} followers</div>
          </div>
          <span class="expand-chevron" :class="{ open: expandedRows[row.influencerId] }" aria-hidden="true">⌄</span>
        </button>

        <div class="card-divider"></div>

        <template v-if="expandedRows[row.influencerId]">
          <ul class="campaign-list">
            <li v-for="c in row.campaigns" :key="c.campaignId" class="campaign-list-item">
              <span class="campaign-list-name">{{ c.campaignName }}</span>
              <span class="campaign-list-views">{{ formatCompactNumber(c.views) }} views</span>
            </li>
          </ul>
          <div class="card-collab-row">
            <button type="button" class="btn btn-primary btn-create btn-sm" @click="openCollabModal(row.influencer)">
              Collaborate
            </button>
          </div>
        </template>
      </li>
    </ul>

    <CampaignFormModal
      v-if="showCollabModal"
      :preferred-influencer-url="collabInfluencerUrl"
      @close="showCollabModal = false"
    />
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
  /* SelectDropdown (and anything else using --accent) should use the site's primary red here,
     not the app-wide purple default. */
  --accent: var(--brand-red);
  --accent-bg: var(--brand-red-bg);
  --accent-border: var(--brand-red-border);
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
  margin-bottom: 8px;
  gap: 16px;
  flex-wrap: wrap;
}
.header-row h1 {
  margin: 0;
}
.hint {
  color: var(--text);
  margin: 4px 0 24px;
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
  border-color: var(--brand-red-border);
  color: var(--brand-red);
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

.engaged-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.engaged-card {
  padding: 0;
  overflow: hidden;
}
.card-top {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
}
.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.identity {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.name-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}
.name {
  font-weight: 600;
  color: var(--text-h);
}
.handle {
  font-size: 12px;
  color: var(--brand-red);
  text-decoration: none;
}
.handle:hover {
  text-decoration: underline;
}
.followers {
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
.campaign-list {
  list-style: none;
  margin: 0;
  padding: 8px 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.campaign-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
}
.campaign-list-item:not(:last-child) {
  border-bottom: 1px solid var(--border);
}
.campaign-list-name {
  font-size: 13px;
  color: var(--text-h);
}
.campaign-list-views {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}
.card-collab-row {
  display: flex;
  justify-content: flex-end;
  padding: 0 20px 16px;
}

@media (max-width: 640px) {
  .toolbar {
    flex-wrap: wrap;
  }
  .filter-row {
    gap: 12px;
  }
}
</style>
