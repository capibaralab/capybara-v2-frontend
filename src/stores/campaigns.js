import { defineStore } from 'pinia'
import * as api from '../services/api'
import { useNotificationsStore } from './notifications'

export const useCampaignsStore = defineStore('campaigns', {
  state: () => ({
    campaigns: [],
  }),
  getters: {
    getById: (state) => (id) => state.campaigns.find((campaign) => campaign.id === id),
  },
  actions: {
    _upsert(campaign) {
      const index = this.campaigns.findIndex((item) => item.id === campaign.id)
      if (index === -1) this.campaigns.unshift(campaign)
      else this.campaigns[index] = campaign
    },

    async fetchAll() {
      this.campaigns = await api.listCampaigns()
    },

    async fetchOne(id) {
      const campaign = await api.getCampaign(id)
      this._upsert(campaign)
      return campaign
    },

    async createCampaign(payload) {
      const campaign = await api.createCampaign(payload)
      this._upsert(campaign)
      return campaign
    },

    // Awaited directly by the post-submit matching flow (the advertiser watches this happen
    // live), unlike the rest of the app's fire-and-forget + notification pattern.
    async runMatching(campaignId) {
      const updated = await api.runAiMatching(campaignId)
      this._upsert(updated)
      return updated
    },

    async sendOffers(campaignId, influencerIds) {
      const updated = await api.sendCollaborationOffers(campaignId, influencerIds)
      this._upsert(updated)
      return updated
    },

    async respondToOffer(offerId, decision) {
      const { campaign, becameLive } = await api.respondToOffer(offerId, decision)
      this._upsert(campaign)
      if (becameLive) {
        useNotificationsStore().push({
          type: 'campaign_live',
          message: `Your campaign with ${campaign.companyName} is live`,
          link: `/advertiser/campaigns/${campaign.id}`,
        })
      }
      return campaign
    },
  },
})
