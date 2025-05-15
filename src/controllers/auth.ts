import express from 'express';
import passport from 'passport';

import BaseController from './base';
import { redirectUrl, authUrl } from '../urls';

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
   * Sucess callback after authentication.
   *
   * @param {Response} res Response object
   */
  private success = (req, res) => {
    // print user info (returned by GitHub Strategy)
    // console.log('success', req.session.passport.user)
    res.send(
      `<html>
        <script>
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
    // console.log('logout', req.user)
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
    // console.log('loggedIn', req.user)
    const data = {
      handle: '',
      isAuthenticated: false,
      name: '',
      profilePicUrl: '',
    };
    if (req.user === undefined) {
      res.send({
        ...data,
        isAuthenticated: false,
      });
    } else {
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
