import { nodeEnv } from '../config/index';

/**
 * Prefix for URLs for authentication with GitHub.
 */
const authMain = '/auth/github';

/**
 * Stores the different types of URLs required for authentication.
 *
 * _Exported as `authUrl` for configuring endpoints of authentication._
 */
export const authUrl = {
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
};

/**
 * Stores redirection URL for successful and failed authentication.
 *
 *  _Exported as `redirectUrl` for redirections._
 */
const redirectUrl = {
  /**
   * The URL redirected to if the user is not logged in.
   */
  failure: authUrl.isAuthenticated,
  /**
   * The URL redirected by this back-end service to homepage.
   */
  successful: '',
};

/**
 * Stores the domain name for callback url after successful authentication.
 *
 * _Exported as `hostUrl` for callback after GitHub sends `code`._
 */
let hostUrl = '';
if (nodeEnv === 'production') {
  // hardcode url here
  redirectUrl.successful = 'https://vega.github.io/editor';
  hostUrl = 'https://vega-editor-backend.vercel.app';
} else if (nodeEnv === 'development') {
  redirectUrl.successful = authUrl.isAuthenticated;
}

export { redirectUrl, hostUrl };

const gistMain = '/gists';

export const gistUrl = {
  main: gistMain,
  allGists: `${gistMain}/user`,
  createGist: `${gistMain}/create`,
  updateGist: `${gistMain}/update`,
  validateToken: `${gistMain}/validate-token`,
};

export const gistRawUrl = 'https://gist.githubusercontent.com';

export const docsUrl = 'https://vega.github.io/editor-backend';
