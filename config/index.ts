import dotenv from 'dotenv'

/**
 * Imports all the environment configuration from .env file
 */
dotenv.config()

/**
 * Export GitHub application credentials
 */
export const githubOauth: any = {
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
}

/**
 * Export session secret
 */
export const sessionSecret: string = process.env.SESSION_SECRET

/**
 * Export successful redirect URL
 */
export const homepageUrl: string = process.env.HOMEPAGE_URL

/**
 * Export array of allowed domains
 */

export const whitelist: string[] = process.env.DOMAINS.split(',')

/**
 * Export environment type
 */

 export const nodeEnv: string = process.env.NODE_ENV
