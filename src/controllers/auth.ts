import express from 'express'
import passport from 'passport'

import BaseController from './base'
import { successfulRedirectUrl, authUrl } from '../urls'

// Enables passport to recognize the configuration.
require('../../config/passport')

/**
 * Controller for OAuthentication via GitHub.
 *
 * See [[IBaseController]] for more details.
 */
class AuthController implements BaseController {

  public path = authUrl.main

  public router = express.Router()

  /**
   * Constructor of `AuthController`.
   */
  constructor() {
    this.initializeRoutes()
  }

  /**
   * Initialization of routes of `AuthController`.
   *
   * @private
   */
  private initializeRoutes = () => {
    this.router.get(this.path, passport.authenticate(
      'github', { scope: 'gist' }
    ))
    this.router.get(authUrl.callback,
      passport.authenticate('github'),
      this.success
    )
    this.router.get(authUrl.logout, this.logout)
    this.router.get(authUrl.isAuthenticated, this.loggedIn)
  }

  /**
   * Sucess callback after authentication.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @private
   */
  private success = (_, res) => {
    // gives info of user (returned by GitHub Strategy)
    // console.log(req.session.passport.user)
    res.redirect(successfulRedirectUrl)
  }

  /**
   * Logging out of a session.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @private
   */
  private logout = (req, res) => {
    // gives info of user
    // console.log(req.user)
    if (req.user) {
      req.session.destroy()
      res.clearCookie('vegasessid', { path: '/' }).status(200)
      res.redirect(successfulRedirectUrl)
    }
    else {
      res.redirect(successfulRedirectUrl)
    }
  }

  /**
   * Checks if a user is authenticated.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @private
   */
  private loggedIn = (req, res) => {
    const data = {
      isAuthenticated: false,
    }
    if (req.user === undefined) {
      res.send({
        ...data,
        isAuthenticated: false,
      })
    }
    else {
      res.send({
        ...data,
        isAuthenticated: true,
      })
    }
  }
}

/**
 * _Export `AuthController`._
 */
export default AuthController
