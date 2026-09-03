<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { COUNTRIES } from '../services/countries'

const props = defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const query = ref('')
const rootEl = ref(null)
const searchInputEl = ref(null)

const selectedLabel = computed(() => COUNTRIES.find((c) => c.code === props.modelValue)?.name ?? '')

const filteredCountries = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return COUNTRIES
  return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q))
})

function toggleOpen() {
  open.value = !open.value
  if (open.value) {
    query.value = ''
    nextTick(() => searchInputEl.value?.focus())
  }
}

function selectCountry(country) {
  emit('update:modelValue', country.code)
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
  <div ref="rootEl" class="select-dropdown">
    <button type="button" class="select-trigger" :class="{ open }" @click="toggleOpen">
      <span>{{ selectedLabel || 'Select a country' }}</span>
      <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <div v-if="open" class="select-panel">
      <input
        ref="searchInputEl"
        v-model="query"
        type="text"
        class="search-input"
        placeholder="Search countries…"
        @keydown.escape="open = false"
      />
      <div class="options-list">
        <button
          v-for="country in filteredCountries"
          :key="country.code"
          type="button"
          class="select-option"
          :class="{ selected: country.code === modelValue }"
          @click="selectCountry(country)"
        >
          {{ country.name }}
        </button>
        <p v-if="!filteredCountries.length" class="no-results">No countries match "{{ query }}"</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.select-dropdown {
  position: relative;
}
.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  font: inherit;
  font-size: 14px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  cursor: pointer;
  text-align: left;
}
.select-trigger:hover,
.select-trigger.open {
  border-color: var(--accent-border);
}
.select-trigger:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}
.chevron-icon {
  width: 14px;
  height: 14px;
  color: var(--text);
  flex-shrink: 0;
  transition: transform 0.15s ease;
}
.select-trigger.open .chevron-icon {
  transform: rotate(180deg);
}

.select-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 30;
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.search-input {
  font: inherit;
  font-size: 14px;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
}
.search-input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}
.options-list {
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.select-option {
  font: inherit;
  font-size: 14px;
  text-align: left;
  padding: 8px 10px;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--text-h);
  cursor: pointer;
}
.select-option:hover {
  background: var(--code-bg);
}
.select-option.selected {
  background: var(--accent-bg);
  color: var(--accent);
  font-weight: 600;
}
.no-results {
  padding: 8px 10px;
  margin: 0;
  font-size: 13px;
  color: var(--text);
}
</style>
