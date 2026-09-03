<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotificationsStore } from '../stores/notifications'

const ADVERTISER_MENU_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Campaigns', to: '/advertiser' },
  { label: 'Influencers', to: '/advertiser/influencers-engaged' },
  { label: 'Billing' },
  { label: 'Settings', to: '/settings' },
  { label: 'Support' },
]

const INFLUENCER_MENU_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'My Portfolio', to: '/influencer/portfolio' },
  { label: 'Collaborations', to: '/influencer/collaborations' },
  { label: 'Brands' },
  { label: 'Profit', to: '/influencer/profit' },
  { label: 'Settings', to: '/influencer/settings' },
  { label: 'Support' },
]

const notifications = useNotificationsStore()
const router = useRouter()
const route = useRoute()
const showDropdown = ref(false)
const showMenu = ref(false)

const activeRole = computed(() => (route.path.startsWith('/influencer') ? 'influencer' : 'advertiser'))
const menuItems = computed(() => (activeRole.value === 'influencer' ? INFLUENCER_MENU_ITEMS : ADVERTISER_MENU_ITEMS))

function selectRole(role) {
  router.push(role === 'influencer' ? '/influencer' : '/')
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
  showMenu.value = false
  if (showDropdown.value) {
    notifications.markAllRead()
  }
}

function toggleMenu() {
  showMenu.value = !showMenu.value
  showDropdown.value = false
}

function selectMenuItem(item) {
  showMenu.value = false
  if (item.to) router.push(item.to)
}

function openNotification(notification) {
  notifications.markRead(notification.id)
  showDropdown.value = false
  router.push(notification.link)
}

function timeAgo(isoString) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(isoString).getTime()) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  return `${hours}h ago`
}
</script>

<template>
  <header class="app-nav">
    <div class="app-nav-inner">
      <RouterLink to="/" class="brand">
        <img src="../assets/logo.png" alt="" class="brand-logo" />
        <span class="brand-text">Capybara Lab AI</span>
      </RouterLink>
      <div class="role-toggle" role="tablist" aria-label="View as">
        <button
          type="button"
          role="tab"
          class="role-option"
          :class="{ active: activeRole === 'advertiser' }"
          :aria-selected="activeRole === 'advertiser'"
          @click="selectRole('advertiser')"
        >
          Advertiser
        </button>
        <button
          type="button"
          role="tab"
          class="role-option"
          :class="{ active: activeRole === 'influencer' }"
          :aria-selected="activeRole === 'influencer'"
          @click="selectRole('influencer')"
        >
          Influencer
        </button>
      </div>
      <div class="bell-wrap">
        <button
          type="button"
          class="bell-btn"
          aria-label="Notifications"
          @click="toggleDropdown"
        >
          🔔
          <span v-if="notifications.unreadCount" class="bell-badge">{{ notifications.unreadCount }}</span>
        </button>
        <div v-if="showDropdown" class="dropdown card">
          <p v-if="!notifications.items.length" class="empty">No notifications yet</p>
          <button
            v-for="notification in notifications.items"
            :key="notification.id"
            type="button"
            class="notification-item"
            :class="{ unread: !notification.read }"
            @click="openNotification(notification)"
          >
            <span class="message">{{ notification.message }}</span>
            <span class="time">{{ timeAgo(notification.createdAt) }}</span>
          </button>
        </div>
      </div>
      <div class="menu-wrap">
        <button type="button" class="menu-btn" :class="{ active: showMenu }" aria-label="Menu" @click="toggleMenu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
        <div v-if="showMenu" class="dropdown card menu-dropdown">
          <button
            v-for="item in menuItems"
            :key="item.label"
            type="button"
            class="menu-item"
            @click="selectMenuItem(item)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-nav {
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 10;
}
.app-nav-inner {
  max-width: 1080px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}
.brand {
  font-weight: 700;
  color: var(--text-h);
  text-decoration: none;
  font-size: 16px;
  margin-right: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.brand-logo {
  width: 28px;
  height: auto;
}
.role-toggle {
  display: flex;
  gap: 2px;
  background: var(--code-bg);
  border-radius: 999px;
  padding: 3px;
}
.role-option {
  border: none;
  background: none;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  padding: 6px 16px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.role-option.active {
  background: var(--bg-raised);
  color: var(--text-h);
  box-shadow: var(--shadow);
}
.bell-wrap {
  position: relative;
}
.bell-btn {
  position: relative;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
}
.bell-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--brand-red);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
.dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 300px;
  max-width: calc(100vw - 32px);
  max-height: 360px;
  overflow-y: auto;
  padding: 8px;
  box-shadow: var(--shadow);
}
.menu-wrap {
  position: relative;
}
.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-h);
  cursor: pointer;
  padding: 4px;
  outline: none;
}
.menu-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.menu-btn.active {
  color: var(--brand-red);
}
.menu-btn svg {
  width: 22px;
  height: 22px;
}
.menu-dropdown {
  width: 180px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.menu-item {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  color: var(--text-h);
}
.menu-item:hover {
  background: var(--code-bg);
}

@media (max-width: 480px) {
  .app-nav-inner {
    padding: 12px 16px;
    gap: 12px;
  }
  .brand-text {
    display: none;
  }
  .role-option {
    padding: 6px 10px;
    font-size: 12px;
  }
}
.empty {
  padding: 12px;
  font-size: 14px;
  text-align: center;
}
.notification-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  font: inherit;
  color: var(--text-h);
}
.notification-item:hover {
  background: var(--code-bg);
}
.notification-item.unread {
  background: var(--bg);
}
.notification-item .message {
  font-size: 14px;
}
.notification-item .time {
  font-size: 12px;
  color: var(--text);
}
</style>
