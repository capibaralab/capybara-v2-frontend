import influencerProfilePhoto from '../assets/influencer profile.jpeg'
import placementsPhoto from '../assets/placements.png'

const PALETTE = ['#aa3bff', '#3b82f6', '#f97316', '#10b981', '#ec4899', '#eab308', '#06b6d4', '#ef4444']

export function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function svgToDataUri(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** Circular influencer profile photo. */
export function generateAvatar() {
  return influencerProfilePhoto
}

/** Influencer content placement photo (numbered placement markers). */
export function generateContentThumbnail() {
  return placementsPhoto
}

/** Deterministic placeholder used in place of real product photography / scraped assets. */
export function generateProductPlaceholder(label) {
  const hash = hashString(label)
  const color = PALETTE[hash % PALETTE.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
    <rect width="320" height="320" fill="${color}" fill-opacity="0.12"/>
    <rect x="90" y="90" width="140" height="140" rx="12" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="3"/>
    <text x="160" y="270" font-family="system-ui, sans-serif" font-size="16" fill="${color}" text-anchor="middle">${label}</text>
  </svg>`
  return svgToDataUri(svg)
}
