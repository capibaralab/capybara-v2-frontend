export const STATUS_LABELS = {
  processing: 'Processing',
  recommendations_ready: 'Recommendations Ready',
  awaiting_approval: 'Awaiting Approval',
  live: 'Live',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function statusLabel(status) {
  return STATUS_LABELS[status] ?? status
}

// Coarser bucket for compact displays (e.g. the homepage campaign list) that don't need
// to distinguish the in-flight sub-stages of getting to "live".
const DISPLAY_STATUS = {
  processing: 'pending',
  recommendations_ready: 'pending',
  awaiting_approval: 'pending',
  live: 'live',
  completed: 'completed',
  cancelled: 'cancelled',
}

const DISPLAY_STATUS_LABELS = {
  pending: 'Pending',
  live: 'Live',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function displayStatus(status) {
  return DISPLAY_STATUS[status] ?? status
}

export function displayStatusLabel(status) {
  return DISPLAY_STATUS_LABELS[displayStatus(status)] ?? status
}
