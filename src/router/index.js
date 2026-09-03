import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { isDevGateUnlocked } from '../services/devGate'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: () => import('../views/WelcomeView.vue'),
      meta: { public: true },
    },
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/advertiser',
      name: 'my-campaigns',
      component: () => import('../views/MyCampaignsView.vue'),
    },
    {
      path: '/advertiser/campaigns/:id',
      name: 'campaign-dashboard',
      component: () => import('../views/CampaignDashboardView.vue'),
    },
    {
      path: '/advertiser/campaigns/:id/recommendations',
      name: 'campaign-recommendations',
      component: () => import('../views/CampaignRecommendationsView.vue'),
    },
    {
      path: '/advertiser/influencers-engaged',
      name: 'influencers-engaged',
      component: () => import('../views/InfluencersEngagedView.vue'),
    },
    {
      path: '/advertiser/influencers/:id',
      name: 'influencer-profile',
      component: () => import('../views/InfluencerProfileView.vue'),
    },
    {
      path: '/influencer',
      name: 'influencer-home',
      component: () => import('../views/InfluencerHomeView.vue'),
    },
    {
      path: '/influencer/campaigns/:id/:offerId',
      name: 'influencer-campaign-dashboard',
      component: () => import('../views/CampaignDashboardView.vue'),
    },
    {
      path: '/influencer/offers',
      name: 'influencer-offer-inbox',
      component: () => import('../views/InfluencerOfferInboxView.vue'),
    },
    {
      path: '/influencer/collaborations',
      name: 'influencer-collaborations',
      component: () => import('../views/InfluencerCollaborationsView.vue'),
    },
    {
      path: '/influencer/collaborations/live',
      name: 'influencer-collaborations-live',
      component: () => import('../views/InfluencerLiveCollaborationsView.vue'),
    },
    {
      path: '/influencer/collaborations/completed',
      name: 'influencer-collaborations-completed',
      component: () => import('../views/InfluencerCompletedCollaborationsView.vue'),
    },
    {
      path: '/influencer/portfolio',
      name: 'influencer-portfolio',
      component: () => import('../views/InfluencerPortfolioView.vue'),
    },
    {
      path: '/influencer/profit',
      name: 'influencer-profit',
      component: () => import('../views/InfluencerProfitView.vue'),
    },
    {
      path: '/influencer/settings',
      name: 'influencer-settings',
      component: () => import('../views/InfluencerSettingsView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
    {
      path: '/onboarding/:step',
      name: 'onboarding',
      component: () => import('../views/OnboardingView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.public) {
    if (to.name === 'login' && isDevGateUnlocked()) {
      return typeof to.query.redirect === 'string' ? to.query.redirect : '/'
    }
    return true
  }
  if (!isDevGateUnlocked()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
