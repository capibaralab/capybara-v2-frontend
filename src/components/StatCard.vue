<script setup>
defineProps({
  icon: { type: String, required: true }, // campaigns | impressions | engagement | budget | influencers | clicks
  value: { type: [String, Number], required: true },
  label: { type: String, required: true },
})
</script>

<template>
  <div class="stat-card card">
    <div class="stat-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <template v-if="icon === 'campaigns'">
          <path d="M3 11l18-5v12L3 14v-3z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </template>
        <template v-else-if="icon === 'impressions'">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </template>
        <template v-else-if="icon === 'engagement'">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </template>
        <template v-else-if="icon === 'budget'">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </template>
        <template v-else-if="icon === 'influencers'">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </template>
        <template v-else-if="icon === 'clicks'">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          <path d="M13 13l6 6" />
        </template>
      </svg>
    </div>
    <span class="stat-value">{{ value }}</span>
    <span class="stat-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.stat-card {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
}
.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--brand-red-bg);
  color: var(--brand-red);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.stat-icon svg {
  width: 17px;
  height: 17px;
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-h);
  line-height: 1.1;
}
.stat-label {
  font-size: 13px;
  color: var(--text);
}

@media (max-width: 640px) {
  .stat-card {
    padding: 12px 14px;
    gap: 4px;
  }
  .stat-icon {
    width: 26px;
    height: 26px;
    margin-bottom: 2px;
  }
  .stat-icon svg {
    width: 14px;
    height: 14px;
  }
  .stat-value {
    font-size: 18px;
  }
  .stat-label {
    font-size: 12px;
  }
}
</style>
