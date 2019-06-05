import { homepageUrl } from '../config/index'

/**
 * Export successful authentication redirect URL
 */
export const successfulRedirectUrl: string = homepageUrl

const authMain = '/auth/github'

/**
 * Export urls for authentication with GitHub
 */
export const authUrl: any = {
  main: authMain,
  callback: `${authMain}/callback`,
  logout: `${authMain}/logout`,
}
