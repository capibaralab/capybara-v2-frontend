const STORAGE_KEY = 'capybara_dev_gate'

const GATE_USER = 'capy'
const GATE_PASS = 'capypass'

export function isDevGateUnlocked() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function unlockDevGate(username, password) {
  const userOk = String(username || '').trim() === GATE_USER
  const passOk = String(password || '') === GATE_PASS
  if (!userOk || !passOk) return false
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    return false
  }
  return true
}

export function lockDevGate() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {}
}
