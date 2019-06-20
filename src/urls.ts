import { nodeEnv } from '../config/index'

const authMain = '/auth/github'

/**
 * Export urls for authentication with GitHub
 */
export const authUrl: any = {
  main: authMain,
  callback: `${authMain}/callback`,
  logout: `${authMain}/logout`,
  isAuthenticated: `${authMain}/logged`,
}

/**
 * Export successful authentication redirect URL
 */
let successfulRedirectUrl = ''
if (nodeEnv === 'production') {
  // hardcode url here
  successfulRedirectUrl = 'https://vega.github.io/editor'
}
else if (nodeEnv === 'development') {
  successfulRedirectUrl = authUrl.isAuthenticated
}

export { successfulRedirectUrl }
