<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  hasError: { type: Boolean, default: false },
  id: { type: String, default: undefined },
})
const emit = defineEmits(['update:modelValue'])

// Hardcoded English names — the whole point is to not depend on the OS/browser locale.
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const today = new Date()
const open = ref(false)
const rootEl = ref(null)

function parseModelValue() {
  if (!props.modelValue) return null
  const [y, m, d] = props.modelValue.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const viewYear = ref((parseModelValue() ?? today).getFullYear())
const viewMonth = ref((parseModelValue() ?? today).getMonth())

const displayLabel = computed(() => {
  const date = parseModelValue()
  if (!date) return ''
  return `${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`
})

function toIsoDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const todayIso = toIsoDate(today)

const daysGrid = computed(() => {
  const firstOfMonth = new Date(viewYear.value, viewMonth.value, 1)
  const gridStart = new Date(viewYear.value, viewMonth.value, 1 - firstOfMonth.getDay())
  const cells = []
  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(gridStart)
    cellDate.setDate(gridStart.getDate() + i)
    const iso = toIsoDate(cellDate)
    cells.push({
      iso,
      day: cellDate.getDate(),
      inCurrentMonth: cellDate.getMonth() === viewMonth.value,
      isToday: iso === todayIso,
      isSelected: iso === props.modelValue,
    })
  }
  return cells
})

function changeMonth(delta) {
  const next = new Date(viewYear.value, viewMonth.value + delta, 1)
  viewYear.value = next.getFullYear()
  viewMonth.value = next.getMonth()
}

function toggleOpen() {
  if (!open.value) {
    const current = parseModelValue() ?? today
    viewYear.value = current.getFullYear()
    viewMonth.value = current.getMonth()
  }
  open.value = !open.value
}

function selectDay(cell) {
  emit('update:modelValue', cell.iso)
  open.value = false
}

function onDocumentClick(event) {
  if (open.value && rootEl.value && !rootEl.value.contains(event.target)) {
    open.value = false
  }
}

function onKeydown(event) {
  if (event.key === 'Escape' && open.value) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick, true)
  document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick, true)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="rootEl" class="date-picker">
    <button
      :id="id"
      type="button"
      class="date-picker-trigger"
      :class="{ 'has-error': hasError }"
      @click="toggleOpen"
    >
      <span :class="{ placeholder: !modelValue }">{{ displayLabel || 'Select date' }}</span>
      <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 6h15a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V6.75A.75.75 0 014.5 6z"
        />
      </svg>
    </button>

    <div v-if="open" class="date-picker-panel">
      <div class="date-picker-header">
        <button type="button" class="nav-btn" aria-label="Previous month" @click="changeMonth(-1)">‹</button>
        <span class="date-picker-title">{{ MONTH_NAMES[viewMonth] }} {{ viewYear }}</span>
        <button type="button" class="nav-btn" aria-label="Next month" @click="changeMonth(1)">›</button>
      </div>
      <div class="date-picker-weekdays">
        <span v-for="wd in WEEKDAY_NAMES" :key="wd">{{ wd }}</span>
      </div>
      <div class="date-picker-grid">
        <button
          v-for="cell in daysGrid"
          :key="cell.iso"
          type="button"
          class="day-cell"
          :class="{ 'is-outside': !cell.inCurrentMonth, 'is-today': cell.isToday, 'is-selected': cell.isSelected }"
          @click="selectDay(cell)"
        >
          {{ cell.day }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.date-picker {
  position: relative;
}
.date-picker-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  font: inherit;
  font-size: 15px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  cursor: pointer;
  text-align: left;
}
.date-picker-trigger.has-error {
  border-color: var(--danger);
}
.date-picker-trigger:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}
.date-picker-trigger .placeholder {
  color: var(--text);
}
.calendar-icon {
  width: 18px;
  height: 18px;
  color: var(--text);
  flex-shrink: 0;
}

.date-picker-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 30;
  width: 280px;
  max-width: calc(100vw - 32px);
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow);
  padding: 12px;
}
.date-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.date-picker-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-h);
}
.nav-btn {
  background: none;
  border: none;
  font-size: 18px;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-h);
}
.nav-btn:hover {
  background: var(--code-bg);
}
.date-picker-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}
.date-picker-weekdays span {
  text-align: center;
  font-size: 11px;
  color: var(--text);
}
.date-picker-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.day-cell {
  aspect-ratio: 1;
  border: none;
  background: none;
  border-radius: 50%;
  font-size: 13px;
  color: var(--text-h);
  cursor: pointer;
}
.day-cell:hover {
  background: var(--code-bg);
}
.day-cell.is-outside {
  color: var(--text);
  opacity: 0.4;
}
.day-cell.is-today {
  box-shadow: inset 0 0 0 1px var(--accent-border);
}
.day-cell.is-selected {
  background: var(--accent);
  color: #fff;
}
</style>
