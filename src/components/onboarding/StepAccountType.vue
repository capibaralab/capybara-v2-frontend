<script setup>
import { ref } from 'vue'
import { useCampaignDraftStore } from '../../stores/campaignDraft'
import brandImage from '../../assets/brand.png'
import influencerImage from '../../assets/influencer.png'

const draft = useCampaignDraftStore()
const error = ref('')

function select(type) {
  draft.accountType = type
  error.value = ''
}

function validate() {
  if (!draft.accountType) {
    error.value = 'Select an option to continue'
    return false
  }
  error.value = ''
  return true
}

defineExpose({ validate })
</script>

<template>
  <div>
    <h2>Influencer or Brand?</h2>
    <div class="option-grid">
      <button
        type="button"
        class="option-card"
        :class="{ selected: draft.accountType === 'brand' }"
        @click="select('brand')"
      >
        <img :src="brandImage" alt="" class="option-image" />
        <div class="option-text">
          <strong>Brand</strong>
          <span>I want to promote my products on social media through influencers who align with my target audience.</span>
        </div>
      </button>
      <button
        type="button"
        class="option-card"
        :class="{ selected: draft.accountType === 'influencer' }"
        @click="select('influencer')"
      >
        <img :src="influencerImage" alt="" class="option-image" />
        <div class="option-text">
          <strong>Influencer</strong>
          <span>I want to monetize my content by promoting products that are relevant to my followers’ needs and interests.</span>
        </div>
      </button>
    </div>
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>

<style scoped>
.option-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}
.option-card {
  display: flex;
  align-items: center;
  gap: 20px;
  text-align: left;
  padding: 22px 24px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg);
  cursor: pointer;
}
.option-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}
.option-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.option-card strong {
  font-size: 17px;
  color: var(--text-h);
}
.option-card span {
  font-size: 14px;
  line-height: 1.4;
  color: var(--text);
}
.option-card.selected {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}
.option-card.selected strong {
  color: var(--accent);
}
</style>
