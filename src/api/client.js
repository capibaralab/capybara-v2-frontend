const DEFAULT_DELAY_MS = 300

function delay(ms = DEFAULT_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Mirrors the response envelope a real HTTP client (e.g. axios) would return,
 * so real endpoints can replace mock ones without changing calling code.
 */
export async function mockRequest(data, { delayMs, shouldFail = false, errorMessage = 'Request failed' } = {}) {
  await delay(delayMs)
  if (shouldFail) {
    const error = new Error(errorMessage)
    error.response = { status: 400, data: { message: errorMessage } }
    throw error
  }
  return { data, status: 200 }
}
