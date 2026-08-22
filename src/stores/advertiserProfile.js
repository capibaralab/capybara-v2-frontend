import { defineStore } from 'pinia'

function defaultState() {
  return {
    onboarded: false,
    username: '',
    email: '',
    companyName: '',
    companyWebsite: '',
    categories: [],
    targetSegments: ['all'],
    targetGender: ['male', 'female'],
    audienceIntent: '',
    billing: null, // { last4 } once onboarded
  }
}

export const useAdvertiserProfileStore = defineStore('advertiserProfile', {
  state: defaultState,
  actions: {
    completeOnboarding(profile) {
      Object.assign(this, profile, { onboarded: true })
    },
  },
})
