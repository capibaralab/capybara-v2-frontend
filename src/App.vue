<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNavBar from './components/AppNavBar.vue'
import AppFooter from './components/AppFooter.vue'

const route = useRoute()
const showNav = computed(
  () => route.name !== 'login' && route.name !== 'welcome' && route.name !== 'onboarding'
)
const showFooter = computed(() => route.name !== 'login')
</script>

<template>
  <AppNavBar v-if="showNav" />
  <div class="page-content">
    <router-view />
  </div>
  <AppFooter v-if="showFooter" />
</template>

<style scoped>
.page-content {
  flex: 1;
}
</style>
