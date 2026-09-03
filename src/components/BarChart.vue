<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, BarController, Tooltip } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Tooltip)

const props = defineProps({
  items: { type: Array, required: true }, // [{ label, value }]
  formatValue: { type: Function, default: (value) => String(value) },
  color: { type: String, default: '' }, // falls back to the --brand-red token when unset
})

function readTheme() {
  const styles = getComputedStyle(document.documentElement)
  return {
    text: styles.getPropertyValue('--text').trim(),
    textH: styles.getPropertyValue('--text-h').trim(),
    grid: styles.getPropertyValue('--border').trim(),
    surface: styles.getPropertyValue('--bg-raised').trim(),
    brandRed: styles.getPropertyValue('--brand-red').trim(),
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

const chartData = computed(() => ({
  labels: props.items.map((item) => item.label),
  datasets: [
    {
      data: props.items.map((item) => item.value),
      backgroundColor: props.color || theme.value.brandRed,
      borderRadius: 4,
      maxBarThickness: 22,
    },
  ],
}))

const chartOptions = computed(() => ({
  indexAxis: 'y',
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
      callbacks: {
        label: (context) => props.formatValue(context.parsed.x),
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: { color: theme.value.grid },
      border: { display: false },
      ticks: {
        color: theme.value.text,
        maxTicksLimit: 5,
        callback: (value) => props.formatValue(value),
      },
    },
    y: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: theme.value.textH, font: { size: 13 } },
    },
  },
}))

const chartHeight = computed(() => Math.max(120, props.items.length * 48))
</script>

<template>
  <div class="bar-chart-wrap" :style="{ height: chartHeight + 'px' }">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.bar-chart-wrap {
  position: relative;
  width: 100%;
}
</style>
