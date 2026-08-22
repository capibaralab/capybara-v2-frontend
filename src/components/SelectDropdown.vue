<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], required: true },
  options: { type: Array, required: true }, // [{ value, label }]
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const rootEl = ref(null)

const selectedLabel = computed(() => props.options.find((opt) => opt.value === props.modelValue)?.label ?? '')

function toggleOpen() {
  open.value = !open.value
}

function selectOption(option) {
  emit('update:modelValue', option.value)
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
      <span>{{ selectedLabel }}</span>
      <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <div v-if="open" class="select-panel">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="select-option"
        :class="{ selected: option.value === modelValue }"
        @click="selectOption(option)"
      >
        {{ option.label }}
      </button>
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
  width: auto;
  font: inherit;
  font-size: 14px;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
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
  z-index: 30;
  min-width: 100%;
  width: max-content;
  max-width: 240px;
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow);
  padding: 6px;
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
</style>
