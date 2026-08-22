import { generateAvatar } from './avatar'

const RAW_INFLUENCERS = [
  { id: 'inf-01', name: 'Ava Chen', handle: '@ava.styles', categories: ['Fashion', 'Beauty'], segments: ['teens', 'adults'], followers: 128000 },
  { id: 'inf-02', name: 'Marco Ruiz', handle: '@marco.lifts', categories: ['Fashion'], segments: ['adults', 'teens'], followers: 214000 },
  { id: 'inf-03', name: 'Priya Nair', handle: '@priya.eats', categories: ['Food & Beverage'], segments: ['adults', 'elderly'], followers: 96000 },
  { id: 'inf-04', name: 'Liam Foster', handle: '@liam.codes', categories: ['Tech'], segments: ['teens', 'adults'], followers: 342000 },
  { id: 'inf-05', name: 'Sofia Rossi', handle: '@sofia.wanders', categories: ['Fashion'], segments: ['adults'], followers: 187000 },
  { id: 'inf-06', name: 'Noah Kim', handle: '@noah.athome', categories: ['Home'], segments: ['adults', 'elderly'], followers: 74000 },
  { id: 'inf-07', name: 'Ella Brooks', handle: '@ella.playtime', categories: ['Toys'], segments: ['kids'], followers: 58000 },
  { id: 'inf-08', name: 'Zoe Martins', handle: '@zoe.glow', categories: ['Beauty', 'Fashion'], segments: ['teens'], followers: 265000 },
  { id: 'inf-09', name: 'Diego Alvarez', handle: '@diego.fit', categories: ['Food & Beverage'], segments: ['adults'], followers: 152000 },
  { id: 'inf-10', name: 'Grace Lin', handle: '@grace.travels', categories: ['Fashion'], segments: ['adults', 'seniors'], followers: 121000 },
  { id: 'inf-11', name: 'Oliver Bennett', handle: '@oliver.techdaily', categories: ['Tech', 'Home'], segments: ['adults'], followers: 89000 },
  { id: 'inf-12', name: 'Mia Anderson', handle: '@mia.familytime', categories: ['Toys', 'Home'], segments: ['kids', 'adults'], followers: 103000 },
  { id: 'inf-13', name: 'Jasmine Patel', handle: '@jasmine.glowup', categories: ['Beauty'], segments: ['teens', 'adults'], followers: 176000 },
  { id: 'inf-14', name: 'Ryan Cooper', handle: '@ryan.gearup', categories: ['Tech'], segments: ['adults'], followers: 134000 },
  { id: 'inf-15', name: 'Isabella Cruz', handle: '@isabella.trips', categories: ['Food & Beverage'], segments: ['adults', 'seniors'], followers: 219000 },
  { id: 'inf-16', name: 'Ethan Walsh', handle: '@ethan.dailytech', categories: ['Tech'], segments: ['teens', 'adults'], followers: 298000 },
  { id: 'inf-17', name: 'Chloe Bennett', handle: '@chloe.threads', categories: ['Fashion'], segments: ['teens'], followers: 87000 },
  { id: 'inf-18', name: 'Lucas Moreau', handle: '@lucas.kitchen', categories: ['Food & Beverage'], segments: ['adults', 'elderly'], followers: 145000 },
  { id: 'inf-19', name: 'Aria Novak', handle: '@aria.nest', categories: ['Home', 'Toys'], segments: ['adults', 'kids'], followers: 68000 },
  { id: 'inf-20', name: 'Marcus Webb', handle: '@marcus.strong', categories: ['Fashion'], segments: ['adults', 'teens'], followers: 251000 },
]

export const MOCK_INFLUENCERS = RAW_INFLUENCERS.map((influencer) => ({
  ...influencer,
  avatarUrl: generateAvatar(influencer.name),
}))

export function findInfluencerById(id) {
  return MOCK_INFLUENCERS.find((influencer) => influencer.id === id)
}
