import passport from 'passport'
import passportGitHub from 'passport-github2'

import { githubOauth } from './index'
import { authUrl } from '../src/urls'

const GitHubStrategy = passportGitHub.Strategy

/**
 * Serializes user profile returned after authentication
 *
 * @param {object} user User profile
 * @param {function} done Method called internally by passport.js to resume
 * process
 */
passport.serializeUser<any, any>((user, done) => {
  done(null, user.id)
})

/**
 * Deserializes cookie sent to know which user is logged in
 *
 * @param {string} id The GitHub id of the user
 * @param {function} done Method called internally by passport.js to resume
 * process
 */
passport.deserializeUser((id: string, done: Function) => {
  done(null, id)
})

/**
 * GitHub OAuth strategy configuration
 * 
 * @param {Strategy} strategy OAuth strategy
 * @param {function} callback Callback after successful authentication  
 */
passport.use(new GitHubStrategy({
  clientID: githubOauth.GITHUB_CLIENT_ID,
  clientSecret: githubOauth.GITHUB_CLIENT_SECRET,
  callbackURL: authUrl.callback,
}, (accessToken, refreshToken, profile, done) => {
  done(null, profile)
}))

/**
 * Export passport configuration
 */
export default passport
