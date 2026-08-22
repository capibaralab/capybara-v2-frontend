import { mockRequest } from '../api/client'
import { hashString, generateAvatar, generateProductPlaceholder, generateContentThumbnail } from './avatar'
import { CATEGORY_OPTIONS, SEGMENT_OPTIONS } from './constants'
import { MOCK_INFLUENCERS, findInfluencerById } from './mockInfluencers'

/** In-memory mock "database" — stands in for a real backend's persistence layer. */
const campaigns = []

const KEYWORD_TO_CATEGORY = {
  fashion: 'Fashion', wear: 'Fashion', apparel: 'Fashion', style: 'Fashion', styles: 'Fashion',
  beauty: 'Beauty', cosmetic: 'Beauty', skincare: 'Beauty', makeup: 'Beauty', glow: 'Beauty',
  tech: 'Tech', software: 'Tech', app: 'Tech', ai: 'Tech', digital: 'Tech', soft: 'Tech',
  food: 'Food & Beverage', kitchen: 'Food & Beverage', snack: 'Food & Beverage', drink: 'Food & Beverage', coffee: 'Food & Beverage', eats: 'Food & Beverage',
  home: 'Home', decor: 'Home', furniture: 'Home', house: 'Home',
  kid: 'Toys', kids: 'Toys', baby: 'Toys', toy: 'Toys', toys: 'Toys', child: 'Toys', family: 'Toys',
}

function findCampaign(campaignId) {
  const campaign = campaigns.find((item) => item.id === campaignId)
  if (!campaign) throw new Error(`Campaign ${campaignId} not found`)
  return campaign
}

function suggestCategoriesFor(companyName, companyWebsite) {
  const haystack = `${companyName} ${companyWebsite}`.toLowerCase()
  const matched = new Set()
  for (const [keyword, category] of Object.entries(KEYWORD_TO_CATEGORY)) {
    if (haystack.includes(keyword)) matched.add(category)
  }
  if (matched.size < 2) {
    const seed = hashString(haystack || 'capybara')
    const shuffled = [...CATEGORY_OPTIONS].sort((a, b) => hashString(a + seed) - hashString(b + seed))
    for (const category of shuffled) {
      if (matched.size >= 3) break
      matched.add(category)
    }
  }
  return [...matched].slice(0, 4)
}

function scoreInfluencer(influencer, campaign) {
  const categoryOverlap = influencer.categories.filter((c) => campaign.categories.includes(c)).length
  // "All" targets every segment, so it always counts as a single satisfied match rather than 0.
  const segmentOverlap = campaign.targetSegments.includes('all')
    ? 1
    : influencer.segments.filter((s) => campaign.targetSegments.includes(s)).length
  const spread = hashString(influencer.id + campaign.id) % 15
  return Math.min(99, 45 + categoryOverlap * 16 + segmentOverlap * 9 + spread)
}

function titleCase(text) {
  return text.replace(/[-_.]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

const SEGMENT_LABELS = Object.fromEntries(SEGMENT_OPTIONS.map((option) => [option.value, option.label]))

function describeAudience(segments, categories) {
  const segmentPart = segments.includes('all')
    ? 'All ages'
    : segments.map((segment) => SEGMENT_LABELS[segment] ?? segment).join(' / ')
  return `${segmentPart} · ${categories.join(', ')}`
}

function profileLinkFor(handle) {
  return `https://instagram.com/${handle.replace('@', '')}`
}

const PLACEMENT_TEMPLATES = [
  { title: 'Feed Post Placement', description: 'Appears in the lower-right foreground of an existing lifestyle post, styled naturally into the shot.' },
  { title: 'Story Placement', description: 'Featured in a 24-hour story slide, held naturally during a routine segment.' },
  { title: 'Reel Placement', description: 'Appears mid-scroll in a short-form video clip, blended into the background setting.' },
  { title: 'Carousel Placement', description: 'Shown on a slide of a multi-image carousel post, placed alongside existing props.' },
]

const PLACEMENT_PRICE_SHARES = [0.45, 0.33, 0.22]

function generatePlacementsFor(seedKey, budget) {
  const pool = (budget > 0 ? budget : 800) * 0.6
  const templateOrder = PLACEMENT_TEMPLATES.map((_, index) => index).sort(
    (a, b) => hashString(seedKey + a) - hashString(seedKey + b),
  )
  return templateOrder.slice(0, 3).map((templateIndex, i) => {
    const template = PLACEMENT_TEMPLATES[templateIndex]
    const variance = hashString(seedKey + i) % 20
    return {
      id: crypto.randomUUID(),
      title: template.title,
      description: template.description,
      viewabilityPercent: Math.min(96, 55 + variance),
      price: Math.round((pool * PLACEMENT_PRICE_SHARES[i]) / 10) * 10,
    }
  })
}

function buildPreferredInfluencer(url, campaign) {
  const handleRaw = url.split('/').filter(Boolean).pop()?.replace(/[^a-zA-Z0-9_.]/g, '') || 'preferred'
  const seed = hashString(handleRaw + campaign.id)
  const name = titleCase(handleRaw)
  const handle = `@${handleRaw.toLowerCase()}`
  const categories = campaign.categories.slice(0, 2)
  return {
    influencerId: `preferred-${handleRaw}`,
    name,
    handle,
    avatarUrl: generateAvatar(name),
    followers: 50000 + (seed % 450000),
    categories,
    matchScore: Math.min(99, 90 + (seed % 10)),
    isPreferred: true,
    profileLink: profileLinkFor(handle),
    audienceDescription: describeAudience(campaign.targetSegments, categories),
    contentThumbnailUrl: generateContentThumbnail(name),
    placements: generatePlacementsFor(`preferred-${handleRaw}-${campaign.id}`, campaign.budget),
  }
}

function generateRecommendations(campaign) {
  const scored = MOCK_INFLUENCERS.map((influencer) => ({
    influencerId: influencer.id,
    name: influencer.name,
    handle: influencer.handle,
    avatarUrl: influencer.avatarUrl,
    followers: influencer.followers,
    categories: influencer.categories,
    matchScore: scoreInfluencer(influencer, campaign),
    isPreferred: false,
    profileLink: profileLinkFor(influencer.handle),
    audienceDescription: describeAudience(influencer.segments, influencer.categories),
    contentThumbnailUrl: generateContentThumbnail(influencer.name),
    placements: generatePlacementsFor(influencer.id + campaign.id, campaign.budget),
  }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20)

  if (campaign.preferredInfluencerUrl) {
    scored.unshift(buildPreferredInfluencer(campaign.preferredInfluencerUrl, campaign))
  }
  return scored
}

function generateMetrics() {
  const impressions = Math.round(50000 + Math.random() * 200000)
  const engagementRate = Number((2.5 + Math.random() * 6).toFixed(1))
  const reach = Math.round(impressions * (0.5 + Math.random() * 0.3))
  return { impressions, engagementRate, reach }
}

function toIsoDateOnly(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Deterministic day-by-day breakdown so the dashboard's date-range filter has something to
 * scope against. Spans startDate through min(endDate, today) — a still-running campaign only
 * has "spent so far," not its full contracted budget. Days sum back to campaign.metrics/budget.
 */
function generateDailyMetrics(campaign) {
  const start = new Date(campaign.startDate)
  const end = new Date(campaign.endDate)
  const today = new Date()
  const lastDay = end < today ? end : today

  const days = []
  const cursor = new Date(start)
  while (cursor <= lastDay) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  if (!days.length) days.push(new Date(start))

  const weights = days.map((_, i) => 0.5 + (hashString(`${campaign.id}-${i}`) % 100) / 100)
  const weightSum = weights.reduce((sum, w) => sum + w, 0)

  const totalImpressions = campaign.metrics?.impressions ?? 0
  const totalBudget = campaign.budget ?? 0
  const baseEngagement = campaign.metrics?.engagementRate ?? 0

  return days.map((date, i) => ({
    date: toIsoDateOnly(date),
    impressions: Math.round((totalImpressions * weights[i]) / weightSum),
    budgetSpent: Math.round((totalBudget * weights[i]) / weightSum),
    engagementRate: Number((baseEngagement * (0.7 + weights[i] * 0.4)).toFixed(1)),
  }))
}

/**
 * Deterministic per-influencer breakdown of a campaign's totals — mirrors generateDailyMetrics,
 * but split across selectedInfluencerIds instead of days. CTR has no backing data anywhere in
 * the model, so it's synthesized in the same deterministic-hash style as the rest of this mock
 * layer (stable across reloads, not random).
 */
function influencerBreakdown(campaign) {
  const ids = campaign.selectedInfluencerIds || []
  if (!ids.length) return []

  const weights = ids.map((id) => 0.5 + (hashString(`${campaign.id}-${id}`) % 100) / 100)
  const weightSum = weights.reduce((sum, w) => sum + w, 0)
  const totalViews = campaign.metrics?.impressions ?? 0
  const totalBudget = campaign.budget ?? 0

  return ids.map((id, i) => {
    const views = Math.round((totalViews * weights[i]) / weightSum)
    const ctr = Number((1.2 + (hashString(`${campaign.id}-${id}-ctr`) % 46) / 10).toFixed(1))
    return {
      influencerId: id,
      campaignId: campaign.id,
      campaignName: campaign.campaignName || campaign.companyName,
      campaignStatus: campaign.status,
      views,
      budgetSpent: Math.round((totalBudget * weights[i]) / weightSum),
      ctr,
      clicks: Math.round((views * ctr) / 100),
    }
  })
}

/** Flattened { influencerId, campaignId, campaignName, views, budgetSpent, ctr } rows across campaigns. */
export function getEngagedInfluencerBreakdown(campaigns) {
  return campaigns.flatMap((campaign) => influencerBreakdown(campaign))
}

const INTENT_BY_CATEGORY = {
  Fashion: 'Trend-conscious shoppers who love discovering new styles',
  Beauty: 'Skincare and beauty enthusiasts seeking effective products',
  Tech: 'Early adopters excited about the latest technology',
  'Food & Beverage': 'Food lovers looking for their next favorite treat',
  Fitness: 'Fitness enthusiasts building healthier routines',
  Travel: 'Adventurous travelers planning their next trip',
  Home: 'Homeowners upgrading their living spaces',
  Kids: 'Parents looking for great products for their kids',
}

function suggestIntentFor(categories) {
  const match = categories.map((category) => INTENT_BY_CATEGORY[category]).find(Boolean)
  return match ?? 'Engaged shoppers who care about quality and value'
}

export async function suggestCategories({ companyName, companyWebsite }) {
  const suggestions = suggestCategoriesFor(companyName, companyWebsite)
  const { data } = await mockRequest(suggestions, { delayMs: 900 })
  return data
}

export async function suggestAudienceIntent({ categories }) {
  const suggestion = suggestIntentFor(categories || [])
  const { data } = await mockRequest(suggestion, { delayMs: 900 })
  return data
}

export async function scrapeProductInfo({ companyName }) {
  const label = companyName ? `${companyName} product` : 'Featured product'
  const result = { imageUrl: generateProductPlaceholder(label), name: label }
  const { data } = await mockRequest(result, { delayMs: 1300 })
  return data
}

export async function createCampaign(rawPayload) {
  // Mirrors serializing a real HTTP request body, which also strips framework
  // reactivity wrappers (e.g. Pinia's Proxy-based state) that structuredClone can't handle.
  const payload = JSON.parse(JSON.stringify(rawPayload))
  const campaign = {
    id: crypto.randomUUID(),
    campaignName: payload.campaignName,
    startDate: payload.startDate,
    endDate: payload.endDate,
    companyName: payload.companyName,
    companyWebsite: payload.companyWebsite,
    categories: payload.categories,
    targetSegments: payload.targetSegments,
    targetGender: payload.targetGender,
    audienceIntent: payload.audienceIntent,
    product: payload.product,
    preferredInfluencerUrl: payload.preferredInfluencerUrl || '',
    billing: payload.billing ?? { free: true },
    budget: Number(payload.budget),
    targetImpressions: payload.targetImpressions ? Number(payload.targetImpressions) : null,
    status: 'processing',
    createdAt: new Date().toISOString(),
    recommendations: [],
    selectedInfluencerIds: [],
    offers: [],
    metrics: null,
  }
  campaigns.push(campaign)
  const { data } = await mockRequest(structuredClone(campaign), { delayMs: 500 })
  return data
}

/** Simulates the async AI matching + placement-search engine (~20s, watched live by the advertiser). */
export async function runAiMatching(campaignId) {
  const campaign = findCampaign(campaignId)
  const recommendations = generateRecommendations(campaign)
  const { data } = await mockRequest(recommendations, { delayMs: 20000 })
  campaign.recommendations = data
  campaign.status = 'recommendations_ready'
  return structuredClone(campaign)
}

export async function getCampaign(campaignId) {
  const campaign = findCampaign(campaignId)
  const { data } = await mockRequest(structuredClone(campaign), { delayMs: 200 })
  return data
}

export async function listCampaigns() {
  const sorted = [...campaigns].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const { data } = await mockRequest(structuredClone(sorted), { delayMs: 200 })
  return data
}

export async function sendCollaborationOffers(campaignId, rawInfluencerIds) {
  const influencerIds = JSON.parse(JSON.stringify(rawInfluencerIds))
  const campaign = findCampaign(campaignId)
  const offers = influencerIds.map((influencerId) => ({
    id: crypto.randomUUID(),
    influencerId,
    status: 'pending',
    sentAt: new Date().toISOString(),
    respondedAt: null,
  }))
  campaign.offers = offers
  campaign.selectedInfluencerIds = influencerIds
  campaign.status = 'awaiting_approval'
  const { data } = await mockRequest(structuredClone(campaign), { delayMs: 600 })
  return data
}

export async function respondToOffer(offerId, decision) {
  const campaign = campaigns.find((item) => item.offers.some((offer) => offer.id === offerId))
  if (!campaign) throw new Error(`Offer ${offerId} not found`)
  const offer = campaign.offers.find((item) => item.id === offerId)
  offer.status = decision
  offer.respondedAt = new Date().toISOString()

  let becameLive = false
  if (decision === 'approved' && campaign.status !== 'live') {
    campaign.status = 'live'
    campaign.metrics = generateMetrics()
    campaign.dailyMetrics = generateDailyMetrics(campaign)
    becameLive = true
  }

  const { data } = await mockRequest({ campaign: structuredClone(campaign), becameLive }, { delayMs: 500 })
  return data
}

export async function listPendingOffers() {
  const pending = campaigns.flatMap((campaign) =>
    campaign.offers
      .filter((offer) => offer.status === 'pending')
      .map((offer) => ({
        offerId: offer.id,
        campaignId: campaign.id,
        campaignName: campaign.campaignName || campaign.companyName,
        companyName: campaign.companyName,
        productImage: campaign.product?.imageDataUrl ?? '',
        sentAt: offer.sentAt,
        influencer: campaign.recommendations.find((rec) => rec.influencerId === offer.influencerId),
      })),
  )
  pending.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
  const { data } = await mockRequest(structuredClone(pending), { delayMs: 200 })
  return data
}

function collaborationRow(campaign, offer) {
  const breakdown = influencerBreakdown(campaign).find((row) => row.influencerId === offer.influencerId)
  return {
    offerId: offer.id,
    campaignId: campaign.id,
    campaignName: campaign.campaignName || campaign.companyName,
    companyName: campaign.companyName,
    productImage: campaign.product?.imageDataUrl ?? '',
    status: campaign.status,
    sentAt: offer.sentAt,
    respondedAt: offer.respondedAt,
    influencer: findInfluencerById(offer.influencerId),
    views: breakdown?.views ?? 0,
    clicks: breakdown?.clicks ?? 0,
    ctr: breakdown?.ctr ?? 0,
    budgetSpent: breakdown?.budgetSpent ?? 0,
  }
}

function listCollaborationsByCampaignStatus(status) {
  const rows = campaigns
    .filter((campaign) => campaign.status === status)
    .flatMap((campaign) =>
      campaign.offers.filter((offer) => offer.status === 'approved').map((offer) => collaborationRow(campaign, offer)),
    )
  rows.sort((a, b) => new Date(b.respondedAt || b.sentAt) - new Date(a.respondedAt || a.sentAt))
  return rows
}

export async function listLiveCollaborations() {
  const { data } = await mockRequest(structuredClone(listCollaborationsByCampaignStatus('live')), { delayMs: 300 })
  return data
}

export async function listCompletedCollaborations() {
  const { data } = await mockRequest(structuredClone(listCollaborationsByCampaignStatus('completed')), { delayMs: 300 })
  return data
}

function daysAgo(n) {
  const date = new Date()
  date.setDate(date.getDate() - n)
  return date.toISOString()
}

function dateOnly(isoString) {
  return isoString.slice(0, 10)
}

function addDays(dateOnlyStr, n) {
  const date = new Date(dateOnlyStr)
  date.setDate(date.getDate() + n)
  return date.toISOString().slice(0, 10)
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function buildSeedRecommendation(influencerId, matchScore) {
  const influencer = findInfluencerById(influencerId)
  return {
    influencerId: influencer.id,
    name: influencer.name,
    handle: influencer.handle,
    avatarUrl: influencer.avatarUrl,
    followers: influencer.followers,
    categories: influencer.categories,
    matchScore,
    isPreferred: false,
  }
}

/** Demo seed data so the homepage has realistic campaigns/stats to show before any are created. */
function seedCampaigns() {
  const seeds = [
    {
      campaignName: 'Glow Up Summer',
      companyName: 'Solstice Skincare',
      companyWebsite: 'https://solsticeskincare.com',
      categories: ['Beauty'],
      targetSegments: ['adults'],
      audienceIntent: 'Skincare enthusiasts seeking effective products',
      status: 'live',
      createdAt: daysAgo(10),
      budget: 3200,
      targetImpressions: 200000,
      picks: [
        ['inf-08', 91, 'approved'],
        ['inf-01', 78, 'approved'],
      ],
      metrics: { impressions: 142000, engagementRate: 4.8, reach: 98000 },
    },
    {
      campaignName: 'Adventure Ready Launch',
      companyName: 'Nordic Gear Co.',
      companyWebsite: 'https://nordicgear.com',
      categories: ['Fashion'],
      targetSegments: ['adults'],
      audienceIntent: 'Adventurous travelers planning their next trip',
      status: 'processing',
      createdAt: daysAgo(1),
      budget: 1800,
      picks: [],
      metrics: null,
    },
    {
      campaignName: 'Spring Palette Drop',
      companyName: 'Bloom & Co Beauty',
      companyWebsite: 'https://bloomandco.com',
      categories: ['Beauty', 'Fashion'],
      targetSegments: ['teens', 'adults'],
      audienceIntent: 'Trend-conscious shoppers who love discovering new styles',
      status: 'cancelled',
      createdAt: daysAgo(20),
      budget: 2400,
      picks: [['inf-08', 85, 'declined']],
      metrics: null,
    },
    {
      campaignName: 'Trailblazer Series',
      companyName: 'Trailhead Outdoors',
      companyWebsite: 'https://trailheadoutdoors.com',
      categories: ['Fashion'],
      targetSegments: ['adults', 'seniors'],
      audienceIntent: 'Adventurous travelers planning their next trip',
      status: 'completed',
      createdAt: daysAgo(45),
      budget: 5000,
      targetImpressions: 250000,
      picks: [
        ['inf-05', 88, 'approved'],
        ['inf-10', 82, 'approved'],
        ['inf-02', 79, 'approved'],
      ],
      metrics: { impressions: 310000, engagementRate: 6.1, reach: 210000 },
    },
    {
      campaignName: 'Fuel Your Grind',
      companyName: 'Kettlebell Kitchen',
      companyWebsite: 'https://kettlebellkitchen.com',
      categories: ['Food & Beverage'],
      targetSegments: ['adults'],
      audienceIntent: 'Fitness enthusiasts building healthier routines',
      status: 'awaiting_approval',
      createdAt: daysAgo(3),
      budget: 1500,
      picks: [
        ['inf-09', 87, 'pending'],
        ['inf-02', 80, 'pending'],
      ],
      metrics: null,
    },
    {
      campaignName: 'Home Refresh Bundle',
      companyName: 'Nestwell Living',
      companyWebsite: 'https://nestwellliving.com',
      categories: ['Home'],
      targetSegments: ['adults', 'elderly'],
      audienceIntent: 'Homeowners refreshing their living space',
      status: 'live',
      createdAt: daysAgo(18),
      budget: 2600,
      targetImpressions: 120000,
      picks: [
        ['inf-06', 84, 'approved'],
        ['inf-11', 76, 'approved'],
      ],
      metrics: { impressions: 98000, engagementRate: 4.1, reach: 71000 },
    },
    {
      campaignName: 'Code & Coffee Kit',
      companyName: 'Devbrew Co.',
      companyWebsite: 'https://devbrew.co',
      categories: ['Tech', 'Food & Beverage'],
      targetSegments: ['adults'],
      audienceIntent: 'Developers who love their gadgets and their coffee',
      status: 'live',
      createdAt: daysAgo(25),
      budget: 4100,
      targetImpressions: 220000,
      picks: [['inf-04', 90, 'approved']],
      metrics: { impressions: 187000, engagementRate: 3.6, reach: 140000 },
    },
  ]

  for (const seed of seeds) {
    const recommendations = seed.picks.map(([id, score]) => buildSeedRecommendation(id, score))
    const offers = seed.picks.map(([id, , offerStatus]) => ({
      id: crypto.randomUUID(),
      influencerId: id,
      status: offerStatus,
      sentAt: seed.createdAt,
      respondedAt: offerStatus === 'pending' ? null : seed.createdAt,
    }))
    const productLabel = `${seed.companyName} product`
    const startDate = dateOnly(seed.createdAt)

    const campaign = {
      id: crypto.randomUUID(),
      campaignName: seed.campaignName,
      startDate,
      endDate: addDays(startDate, 30),
      companyName: seed.companyName,
      companyWebsite: seed.companyWebsite,
      categories: seed.categories,
      targetSegments: seed.targetSegments,
      targetGender: ['all'],
      audienceIntent: seed.audienceIntent,
      product: {
        method: 'scraped',
        uploadKind: null,
        imageDataUrl: generateProductPlaceholder(productLabel),
        fileName: '',
        modelFileName: '',
        scrapedName: productLabel,
        pdpUrl: `${seed.companyWebsite}/products/${slugify(seed.campaignName)}`,
      },
      preferredInfluencerUrl: '',
      billing: { last4: '4242' },
      budget: seed.budget,
      targetImpressions: seed.targetImpressions ?? null,
      status: seed.status,
      createdAt: seed.createdAt,
      recommendations,
      selectedInfluencerIds: seed.picks.map(([id]) => id),
      offers,
      metrics: seed.metrics,
      dailyMetrics: null,
    }
    if (campaign.metrics) {
      campaign.dailyMetrics = generateDailyMetrics(campaign)
    }
    campaigns.push(campaign)
  }
}

seedCampaigns()
