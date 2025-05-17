import passport from 'passport';
import passportGitHub from 'passport-github2';

import { githubOauth } from './index';
import { authUrl, hostUrl } from '../src/urls';

/**
 * OAuth strategy to authenticate with GitHub. Reference:
 * http://www.passportjs.org/packages/passport-github2/
 */
const GitHubStrategy = passportGitHub.Strategy;

console.log('Configuring GitHub strategy with callback URL:', `${hostUrl}${authUrl.callback}`);
console.log('GitHub client ID is set:', !!githubOauth.GITHUB_CLIENT_ID);
console.log('GitHub client secret is set:', !!githubOauth.GITHUB_CLIENT_SECRET);

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
  console.log('GitHub OAuth callback received');

  if (!profile) {
    console.error('No profile received from GitHub');
    return done(new Error('Failed to retrieve GitHub profile'));
  }

  if (!accessToken) {
    console.error('No access token received from GitHub');
    return done(new Error('No access token provided'));
  }

  console.log('GitHub OAuth successful for user:', profile.username || profile.displayName || 'Unknown');
  done(null, { ...profile, accessToken });
}));

/**
 * Stores the configuration for OAuthentication with passport.
 *
 * _Exported as `passport` for initializing in `app.ts`._
 */
export default passport;
