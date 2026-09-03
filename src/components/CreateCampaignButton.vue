<script setup>
import { ref } from 'vue'
import CampaignFormModal from './campaign-form/CampaignFormModal.vue'

defineProps({
  buttonClass: { type: String, default: 'btn btn-primary btn-create' },
  label: { type: String, default: 'Create Campaign' },
})

const showModal = ref(false)
</script>

<template>
  <button type="button" :class="buttonClass" @click="showModal = true">{{ label }}</button>
  <CampaignFormModal v-if="showModal" @close="showModal = false" />
</template>
