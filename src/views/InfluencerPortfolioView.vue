<script setup>
import { computed, onMounted, ref } from 'vue'
import { useInfluencerProfileStore } from '../stores/influencerProfile'
import { listLiveCollaborations, listCompletedCollaborations } from '../services/api'
import { generateAvatar, generateProductPlaceholder, hashString } from '../services/avatar'
import { SEGMENT_OPTIONS, GENDER_OPTIONS } from '../services/constants'
import { formatCompactNumber, formatCurrency } from '../utils/format'
import StatCard from '../components/StatCard.vue'

const profile = useInfluencerProfileStore()
const loading = ref(true)
const collaborations = ref([])
const copied = ref(false)

const shareUrl = computed(() => {
  const base = `${window.location.origin}/influencer/portfolio`
  return profile.username ? `${base}?u=${encodeURIComponent(profile.username)}` : base
})

async function shareLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
  } catch {
    window.prompt('Copy this link:', shareUrl.value)
  }
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

onMounted(async () => {
  const [live, completed] = await Promise.all([listLiveCollaborations(), listCompletedCollaborations()])
  collaborations.value = [...live, ...completed]
  loading.value = false
})

const avatarUrl = generateAvatar()

const followers = computed(() => 3000 + (hashString(profile.instagramUrl || profile.fullName || 'capybara') % 250000))

const segmentLabels = computed(() => {
  const byValue = Object.fromEntries(SEGMENT_OPTIONS.map((opt) => [opt.value, opt.label]))
  return profile.targetSegments.map((value) => byValue[value] ?? value).join(', ')
})
const genderLabels = computed(() => {
  const byValue = Object.fromEntries(GENDER_OPTIONS.map((opt) => [opt.value, opt.label]))
  return profile.targetGender.map((value) => byValue[value] ?? value).join(', ')
})

function average(values) {
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0
}
const avgStats = computed(() => ({
  views: average(collaborations.value.map((row) => row.views)),
  clicks: average(collaborations.value.map((row) => row.clicks)),
  ctr: average(collaborations.value.map((row) => row.ctr)),
  profit: average(collaborations.value.map((row) => row.budgetSpent)),
}))

const brands = computed(() => {
  const names = [...new Set(collaborations.value.map((row) => row.companyName))]
  return names.map((name) => ({ name, logo: generateProductPlaceholder(name) }))
})
</script>

<template>
  <main class="container portfolio">
    <RouterLink to="/influencer" class="back-link">← Back to Home</RouterLink>
    <div class="page-header">
      <h1>My Portfolio</h1>
      <button type="button" class="btn btn-primary" @click="shareLink">
        {{ copied ? 'Link Copied!' : 'Share Portfolio' }}
      </button>
    </div>

    <section class="profile-header">
      <img :src="avatarUrl" alt="" class="profile-pic" />
      <div class="profile-info">
        <strong>{{ profile.fullName || 'Your Name' }}</strong>
        <a
          v-if="profile.instagramUrl"
          :href="profile.instagramUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="instagram-link"
        >
          {{ profile.instagramUrl }}
        </a>
        <span class="followers">{{ formatCompactNumber(followers) }} followers</span>
      </div>
    </section>

    <section class="portfolio-section card">
      <h2>Audience Summary</h2>
      <div class="field-row">
        <span class="field-label">Segment</span>
        <span class="field-value">{{ segmentLabels || '—' }}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Gender</span>
        <span class="field-value">{{ genderLabels || '—' }}</span>
      </div>
      <ul v-if="profile.audienceFindings.length" class="audience-findings">
        <li v-for="(line, i) in profile.audienceFindings" :key="i">{{ line }}</li>
      </ul>
    </section>

    <section class="portfolio-section">
      <h2>Average Results</h2>
      <p v-if="!loading && !collaborations.length" class="hint">No collaborations yet.</p>
      <div v-else class="stat-grid">
        <StatCard icon="impressions" :value="formatCompactNumber(avgStats.views)" label="Avg Views" />
        <StatCard icon="clicks" :value="formatCompactNumber(avgStats.clicks)" label="Avg Clicks" />
        <StatCard icon="engagement" :value="`${avgStats.ctr.toFixed(1)}%`" label="Avg CTR" />
        <StatCard icon="budget" :value="formatCurrency(avgStats.profit)" label="Avg Profit" />
      </div>
    </section>

    <section class="portfolio-section">
      <h2>Brands I've Worked With</h2>
      <p v-if="!loading && !brands.length" class="hint">No collaborations yet.</p>
      <div v-else class="brand-grid">
        <div v-for="brand in brands" :key="brand.name" class="brand-tile">
          <img :src="brand.logo" :alt="brand.name" class="brand-logo" />
          <span>{{ brand.name }}</span>
        </div>
      </div>
    </section>
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
.portfolio :deep(.btn-primary) {
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
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.page-header h1 {
  margin: 0;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 24px 0 32px;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
.hint {
  color: var(--text);
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
.audience-findings {
  margin: 12px 0 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.audience-findings li {
  font-size: 13px;
  color: var(--text-h);
  line-height: 1.4;
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
