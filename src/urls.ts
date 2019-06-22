import { nodeEnv } from '../config/index'

/**
 * Prefix for URLs for authentication with GitHub.
 */
const authMain = '/auth/github'

/**
 * Stores the different types of URLs required for authentication.
 *
 * _Exported as `authUrl` for configuring endpoints of authentication._
 */
export const authUrl: any = {
  /**
   * Endpoint for signing in with GitHub.
   */
  main: authMain,
  /**
   * The URL redirected to after successful authentication with GitHub.
   */
  callback: `${authMain}/callback`,
  /**
   * Endpoint for signing out of the back-end service.
   */
  logout: `${authMain}/logout`,
  /**
   * Endpoint to verify if the user is authenticated.
   */
  isAuthenticated: `${authMain}/check`,
}

/**
 * The URL redirected by this back-end service to homepage.
 *
 * _Exported as `successfulRedirectUrl` to `/auth/github/callback` route._
 */
let successfulRedirectUrl = ''
/**
 * Stores the domain name for callback url after successful authentication.
 *
 * _Exported as `hostUrl` for callback after GitHub sends `code`._
 */
let hostUrl = ''
if (nodeEnv === 'production') {
  // hardcode url here
  successfulRedirectUrl = 'https://vega.github.io/editor'
  hostUrl = 'https://vega.now.sh'
}
else if (nodeEnv === 'development') {
  successfulRedirectUrl = authUrl.isAuthenticated
}

export { successfulRedirectUrl, hostUrl }
