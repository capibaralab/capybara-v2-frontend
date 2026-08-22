import { defineStore } from 'pinia'

function defaultProduct() {
  return {
    method: null,
    uploadKind: null, // 'image' | 'model', only relevant when method === 'upload'
    imageDataUrl: '',
    fileName: '',
    modelFileName: '',
    scrapedName: '',
    pdpUrl: '',
  }
}

function defaultState() {
  return {
    accountType: '',
    username: '',
    email: '',
    password: '',
    companyName: '',
    companyWebsite: '',
    categories: [],
    targetSegments: ['all'],
    targetGender: ['male', 'female'],
    audienceIntent: '',
    campaignName: '',
    startDate: '',
    endDate: '',
    budget: '',
    targetImpressions: '',
    product: defaultProduct(),
    preferredInfluencerUrl: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  }
}

export const useCampaignDraftStore = defineStore('campaignDraft', {
  state: defaultState,
  getters: {
    // True once anything differs from the untouched default (targetSegments defaults to
    // ['all'], so that alone doesn't count as "entered").
    isDirty: (state) =>
      state.accountType.trim() !== '' ||
      state.username.trim() !== '' ||
      state.email.trim() !== '' ||
      state.password.trim() !== '' ||
      state.companyName.trim() !== '' ||
      state.companyWebsite.trim() !== '' ||
      state.categories.length > 0 ||
      state.targetSegments.length !== 1 ||
      state.targetSegments[0] !== 'all' ||
      state.targetGender.length !== 2 ||
      !state.targetGender.includes('male') ||
      !state.targetGender.includes('female') ||
      state.audienceIntent.trim() !== '' ||
      state.campaignName.trim() !== '' ||
      state.startDate !== '' ||
      state.endDate !== '' ||
      state.budget !== '' ||
      state.targetImpressions !== '' ||
      state.product.method !== null ||
      state.preferredInfluencerUrl.trim() !== '' ||
      state.cardNumber.trim() !== '' ||
      state.expiry.trim() !== '' ||
      state.cvc.trim() !== '',
  },
  actions: {
    reset() {
      Object.assign(this, defaultState())
    },
  },
})
