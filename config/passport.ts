import passport from 'passport';
import passportGitHub from 'passport-github2';

import { githubOauth } from './index';
import { authUrl, hostUrl } from '../src/urls';

/**
 * OAuth strategy to authenticate with GitHub. Reference:
 * http://www.passportjs.org/packages/passport-github2/
 */
const GitHubStrategy = passportGitHub.Strategy;

/**
 * Serializes user profile returned after authentication.
 *
 * @param {object} user User profile
 * @param {function} done Method called internally by passport.js to resume
 * process
 */
passport.serializeUser((user, done) => {
  done(null, user);
});

/**
 * Deserializes cookie sent to know which user is logged in.
 *
 * @param {object} user The GitHub profile of the user
 * @param {function} done Method called internally by passport.js to resume
 * process
 */
passport.deserializeUser((user: object, done: Function) => {
  done(null, user);
});

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
}, (accessToken, refreshToken, profile, done) => {
  done(null, { ...profile, accessToken });
}));

/**
 * Stores the configuration for OAuthentication with passport.
 *
 * _Exported as `passport` for initializing in `app.ts`._
 */
export default passport;
