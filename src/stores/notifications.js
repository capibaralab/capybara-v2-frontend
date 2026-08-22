import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    items: [],
  }),
  getters: {
    unreadCount: (state) => state.items.filter((notification) => !notification.read).length,
  },
  actions: {
    push({ type, message, link }) {
      this.items.unshift({
        id: crypto.randomUUID(),
        type,
        message,
        link,
        read: false,
        createdAt: new Date().toISOString(),
      })
    },
    markRead(id) {
      const item = this.items.find((notification) => notification.id === id)
      if (item) item.read = true
    },
  },
})
