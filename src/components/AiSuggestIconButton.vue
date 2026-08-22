<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  label: { type: String, required: true },
})
defineEmits(['click'])

const tooltipText = computed(() => (props.loading ? 'Generating suggestion…' : props.label))
</script>

<template>
  <span class="ai-icon-wrap">
    <button
      type="button"
      class="ai-icon-btn"
      :class="{ loading }"
      :disabled="loading"
      :aria-label="tooltipText"
      @click="$emit('click')"
    >
      <svg class="ai-icon-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
        />
      </svg>
    </button>
    <span class="ai-icon-tooltip" role="tooltip">{{ tooltipText }}</span>
  </span>
</template>

<style scoped>
.ai-icon-wrap {
  position: relative;
  display: inline-flex;
}
.ai-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  color: var(--brand-red);
  flex-shrink: 0;
}
.ai-icon-svg {
  width: 16px;
  height: 16px;
  display: block;
}
.ai-icon-btn:hover:not(:disabled) {
  background: rgba(255, 83, 78, 0.1);
}
.ai-icon-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.ai-icon-btn.loading .ai-icon-svg {
  animation: ai-icon-pulse 1s ease-in-out infinite;
}
@keyframes ai-icon-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.ai-icon-tooltip {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: max-content;
  max-width: 180px;
  background: #1a1a1a;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  padding: 5px 10px;
  border-radius: 6px;
  white-space: normal;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.15s ease, visibility 0.15s ease;
  z-index: 20;
}
.ai-icon-wrap:hover .ai-icon-tooltip {
  opacity: 1;
  visibility: visible;
  transition-delay: 0.4s;
}
</style>
