<script setup>
import brandImg from '../assets/brand.png'
import influencerImg from '../assets/influencer.png'

const props = defineProps({
  variant: { type: String, required: true }, // 'brand' | 'influencer'
})

const images = { brand: brandImg, influencer: influencerImg }
</script>

<template>
  <img :src="images[props.variant]" :alt="`Capy ${props.variant}`" class="capy-illustration" />
</template>

<style scoped>
.capy-illustration {
  width: 100%;
  max-width: 100px;
  height: auto;
  display: block;
  margin: 0 auto 16px;
}
</style>
