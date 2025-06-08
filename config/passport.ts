import passport from 'passport';
import passportGitHub from 'passport-github2';

import { githubOauth } from './index.js';
import { authUrl, hostUrl } from '../src/urls.js';

/**
 * OAuth strategy to authenticate with GitHub. Reference:
 * http://www.passportjs.org/packages/passport-github2/
 */
const GitHubStrategy = passportGitHub.Strategy;

/**
 * GitHub OAuth strategy configuration.
 *
 * @param {Strategy} strategy OAuth strategy
 * @param {function} callback Callback after successful authentication
 */
passport.use(new GitHubStrategy({
  clientID: githubOauth.GITHUB_CLIENT_ID,
  clientSecret: githubOauth.GITHUB_CLIENT_SECRET,
  callbackURL: `${hostUrl}${authUrl.callback}`,
  scope: ['gist'],
}, (accessToken, refreshToken, profile, done) => {

  if (!profile) {
    return done(new Error('Failed to retrieve GitHub profile'));
  }

  if (!accessToken) {
    return done(new Error('No access token provided'));
  }

  done(null, { ...profile, accessToken });
}));

/**
 * Stores the configuration for OAuthentication with passport.
 *
 * _Exported as `passport` for initializing in `app.ts`._
 */
export default passport;
