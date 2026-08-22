<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Chart as ChartComponent } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  Tooltip,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  Tooltip,
)

const props = defineProps({
  items: { type: Array, required: true }, // [{ label, clicks, ctr }]
})

function readTheme() {
  const styles = getComputedStyle(document.documentElement)
  return {
    text: styles.getPropertyValue('--text').trim(),
    textH: styles.getPropertyValue('--text-h').trim(),
    grid: styles.getPropertyValue('--border').trim(),
    surface: styles.getPropertyValue('--bg-raised').trim(),
    brandRed: styles.getPropertyValue('--brand-red').trim(),
    brandTeal: styles.getPropertyValue('--brand-teal').trim(),
  }
}

const theme = ref(readTheme())
let mediaQuery
function handleSchemeChange() {
  theme.value = readTheme()
}
onMounted(() => {
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', handleSchemeChange)
})
onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', handleSchemeChange)
})

const labels = computed(() => props.items.map((item) => item.label))

const clicksData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      type: 'bar',
      data: props.items.map((item) => item.clicks),
      backgroundColor: theme.value.brandRed,
      borderRadius: 4,
      maxBarThickness: 36,
    },
  ],
}))

const clicksOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: theme.value.surface,
      titleColor: theme.value.textH,
      bodyColor: theme.value.textH,
      borderColor: theme.value.grid,
      borderWidth: 1,
      cornerRadius: 8,
      padding: 10,
      displayColors: false,
      callbacks: { label: (context) => `Clicks: ${context.parsed.y.toLocaleString()}` },
    },
  },
  scales: {
    x: { display: false },
    y: {
      beginAtZero: true,
      grid: { color: theme.value.grid },
      border: { display: false },
      ticks: { color: theme.value.text, maxTicksLimit: 3, font: { size: 11 } },
    },
  },
}))

const ctrData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      type: 'line',
      data: props.items.map((item) => item.ctr),
      borderColor: theme.value.brandTeal,
      backgroundColor: theme.value.brandTeal,
      pointBackgroundColor: theme.value.brandTeal,
      pointRadius: 3,
      borderWidth: 2,
      tension: 0.35,
      fill: false,
    },
  ],
}))

const ctrOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: theme.value.surface,
      titleColor: theme.value.textH,
      bodyColor: theme.value.textH,
      borderColor: theme.value.grid,
      borderWidth: 1,
      cornerRadius: 8,
      padding: 10,
      displayColors: false,
      callbacks: { label: (context) => `CTR: ${context.parsed.y.toFixed(1)}%` },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: theme.value.text, font: { size: 11 } },
    },
    y: { display: false, beginAtZero: true },
  },
}))

const clicksHeight = computed(() => Math.max(100, props.items.length * 40))
</script>

<template>
  <div class="cc-charts">
    <div class="cc-block">
      <span class="cc-caption">Clicks</span>
      <div class="cc-chart-wrap" :style="{ height: clicksHeight + 'px' }">
        <ChartComponent type="bar" :data="clicksData" :options="clicksOptions" />
      </div>
    </div>
    <div class="cc-block">
      <span class="cc-caption">CTR</span>
      <div class="cc-chart-wrap cc-sparkline" :style="{ height: '56px' }">
        <ChartComponent type="line" :data="ctrData" :options="ctrOptions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cc-charts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.cc-caption {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text);
  margin-bottom: 6px;
}
.cc-chart-wrap {
  position: relative;
  width: 100%;
}
</style>
