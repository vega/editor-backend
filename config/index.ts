import dotenv from 'dotenv'

/**
 * Imports all the environment configuration from .env file.
 */
dotenv.config()

/**
 * Stores the client ID and client secret of GitHub OAuth application created
 * [here](https://github.com/settings/developers).
 *
 * _Exported as `githubOauth` for configuring GitHub passport strategy._
 */
export const githubOauth = {
  /**
   * Client ID of OAuth application.
   */
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  /**
   * Client secret of OAuth application.
   */
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
}

/**
 * Stores the configuration for redis store.
 */
export const redisConfiguration = {
  /**
   * Host name for redis store.
   */
  REDIS_HOST: process.env.REDIS_HOST,
  /**
   * Host password for redis store.
   */
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  /**
   * Port number for redis store.
   */
  REDIS_PORT: +process.env.REDIS_PORT,
}

/**
 * Secret used to sign the session ID cookie.
 *
 * _Exported as `sessionSecret` to configure cookie creation._
 *
 */
export const sessionSecret: string = process.env.SESSION_SECRET

/**
 * Array of domains from where requests to back-end (this project) are allowed.
 * Requests from any other domain will be blocked by CORS policy.
 *
 * _Exported as `whitelist` to pass as an argument to `cors()`._
 *
 * @hidden
 */
export const whitelist: string[] = [
  'https://vega.github.io',
  'http://localhost:8081',
  'http://localhost:8080',
  'http://0.0.0.0:8080',
]

/**
 * Stores the type of environment of project. It is either `development` or
 * `production`.
 *
 * _Exported as `nodeEnv` to differentiate behaviour of app on development and
 * production server._
 */
export const nodeEnv: string = process.env.NODE_ENV

/**
 * Stores the expiry date of the cookie set.
 *
 * _Exported as `cookieExpiry`_.
 */
export const cookieExpiry: number = 90 * 24 * 60 * 60 // 90 days
