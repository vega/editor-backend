import express from 'express';
import passport from 'passport';

import BaseController from './base';
import { redirectUrl, authUrl } from '../urls';
import crypto from 'crypto';

// Enables passport to recognize the configuration.
require('../../config/passport');
/**
 * Controller for OAuthentication via GitHub.
 *
 * See [[IBaseController]] for more details.
 */
class AuthController implements BaseController {
  public path = authUrl.main;

  public router = express.Router();

  /**
   * Constructor of `AuthController`.
   */
  constructor() {
    this.initializeRoutes();
  }

  /**
   * Initialization of routes of `AuthController`.
   */
  private initializeRoutes = () => {
    this.router.get(
      this.path,
      passport.authenticate('github', { scope: 'gist' })
    );
    this.router.get(
      authUrl.callback,
      passport.authenticate('github'),
      this.success
    );
    this.router.get(authUrl.logout, this.logout);
    this.router.get(authUrl.isAuthenticated, this.loggedIn);
  };

  /**
   * Handle OPTIONS requests (CORS preflight)
   */
  private handleOptions = (req, res) => {
    const origin = req.headers.origin || '*';

    if (origin === 'null') {
      res.header('Access-Control-Allow-Origin', 'null');
    } else {
      res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Auth-Token, Cache-Control, Pragma, Expires');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Content-Type, Authorization, X-Auth-Token');
    res.status(200).end();
  };

  /**
   * Generate a secure token containing encrypted user data
   * @returns {string} A secure token
   */
  private generateToken = (user: any): string => {

    if (!user || !user._json) return '';

    const randomPart = crypto.randomBytes(16).toString('hex');

    // Simple encoding, can use JWT or better encryption
    const userInfo = {
      id: user._json.id,
      login: user._json.login,
      name: user._json.name,
      avatar_url: user._json.avatar_url,
      randomId: randomPart,
      timestamp: Date.now()
    };

    const dataString = JSON.stringify(userInfo);
    const signature = crypto
      .createHmac('sha256', process.env.SESSION_SECRET || 'vega-editor-secret')
      .update(dataString)
      .digest('hex');

    const token = Buffer.from(JSON.stringify({
      data: dataString,
      signature
    })).toString('base64');

    return token;
  };

  /**
   * Validate a token and extract user info
   * @param {string} token The token to validate
   * @returns {any} The user info if token is valid, null otherwise
   */
  private validateToken = (token: string): any => {
    if (!token) return null;

    try {

      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      const { data, signature } = decoded;


      const expectedSignature = crypto
        .createHmac('sha256', process.env.SESSION_SECRET || 'vega-editor-secret')
        .update(data)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid token signature');
        return null;
      }

      const userInfo = JSON.parse(data);

      const tokenAge = Date.now() - userInfo.timestamp;
      if (tokenAge > 7 * 24 * 60 * 60 * 1000) {
        console.error('Token expired');
        return null;
      }

      return {
        _json: {
          id: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          avatar_url: userInfo.avatar_url
        }
      };
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  };

  /**
   * Success callback after authentication.
   *
   * @param {Response} res Response object
   */
  private success = (req, res) => {
    let authToken = '';
    if (req.user) {
      authToken = this.generateToken(req.user);
    }

    res.send(
      `<html>
        <script>

          const authToken = "${authToken}";
          if (authToken) {
            localStorage.setItem('vega_editor_auth_token', authToken);
          }
          
          if (window.opener === null) {
            window.location = '${redirectUrl.successful}'
          }
          else {
            try {
              window.opener.postMessage(
                {type: 'auth'}, '*'
              )
              window.close()
            } catch (e) {
              window.location = '${redirectUrl.successful}'
            }
          }
        </script>
      </html>`
    );
  };

  /**
   * Logging out of a session.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  private logout = (req, res) => {

    const origin = req.headers.origin || '*';
    if (origin === 'null') {
      res.header('Access-Control-Allow-Origin', 'null');
    } else {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.query.token) {
      const token = req.query.token as string;
      console.log('Logging out with token from query parameter');

      return res.status(204).send();
    }

    if (req.user) {
      res.clearCookie('vega_session', { path: '/' });
      req.session.destroy(err => {
        if (err) {
          console.error('Session did not delete');
        }
      });
      res.send(
        `<html>
          <script>
            if (window.opener === null) {
              window.location.assign('${redirectUrl.successful}')
            }
            else {
              try {
                window.opener.postMessage(
                  {type: 'auth'}, '*'
                )
                window.close()
              } catch (e) {

                window.location.assign('${redirectUrl.successful}')
              }
            }
          </script>
        </html>`
      );
    } else {
      res.redirect(redirectUrl.successful);
    }
  };

  /**
   * Checks if a user is authenticated.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  private loggedIn = (req, res) => {

    const origin = req.headers.origin || '*';
    if (origin === 'null') {
      res.header('Access-Control-Allow-Origin', 'null');
    } else {
      res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Auth-Token');
    res.header('Access-Control-Allow-Credentials', 'true');

    const data = {
      handle: '',
      isAuthenticated: false,
      name: '',
      profilePicUrl: '',
    };

    // Checking for token-based auth
    const authToken = req.headers['x-auth-token'] as string;
    if (authToken) {
      console.log('Received auth token:', authToken.substring(0, 10) + '...');
      const tokenUser = this.validateToken(authToken);
      if (tokenUser && tokenUser._json) {
        console.log('Token validated for user:', tokenUser._json.login);
        return res.send({
          handle: tokenUser._json.login,
          isAuthenticated: true,
          name: tokenUser._json.name,
          profilePicUrl: tokenUser._json.avatar_url,
          authToken
        });
      } else {
        console.log('Token validation failed');
      }
    }

    if (req.user === undefined) {
      res.send({
        ...data,
        isAuthenticated: false
      });
    } else {
      const token = this.generateToken(req.user);
      res.send({
        ...data,
        handle: req.user._json.login,
        isAuthenticated: true,
        name: req.user._json.name,
        profilePicUrl: req.user._json.avatar_url,
      });
    }
  };
}

/**
 * _Export `AuthController`._
 */
export default AuthController;
