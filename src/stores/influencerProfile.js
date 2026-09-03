import { defineStore } from 'pinia'

function defaultState() {
  return {
    onboarded: false,
    username: '',
    email: '',
    fullName: '',
    instagramUrl: '',
    targetSegments: ['all'],
    targetGender: ['male', 'female'],
    audienceIntent: '',
    audienceFindings: [],
    bankAccountHolder: '',
    bankName: '',
    bankCountry: 'US',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    bankIlBankNumber: '',
    bankIlBranchNumber: '',
    bankIban: '',
    bankSwiftCode: '',
  }
}

export const useInfluencerProfileStore = defineStore('influencerProfile', {
  state: defaultState,
  actions: {
    completeOnboarding(profile) {
      Object.assign(this, profile, { onboarded: true })
    },
  },
})
