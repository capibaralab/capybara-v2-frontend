<script setup>
const props = defineProps({
  modelValue: { type: Array, required: true },
  options: { type: Array, required: true }, // [{ value, label }]
  // A value (e.g. "all") that's mutually exclusive with every other option.
  exclusiveValue: { type: String, default: null },
})
const emit = defineEmits(['update:modelValue'])

function isSelected(value) {
  return props.modelValue.includes(value)
}
function toggle(value) {
  if (isSelected(value)) {
    emit('update:modelValue', props.modelValue.filter((v) => v !== value))
    return
  }
  if (value === props.exclusiveValue) {
    emit('update:modelValue', [value])
  } else {
    emit('update:modelValue', [...props.modelValue.filter((v) => v !== props.exclusiveValue), value])
  }
}
</script>

<template>
  <div class="chip-group">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="chip"
      :class="{ selected: isSelected(option.value) }"
      @click="toggle(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
