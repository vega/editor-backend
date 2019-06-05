import express from 'express'
import passport from 'passport'

import BaseController from './base'
import { successfulRedirectUrl, authUrl } from '../urls'

// Enables passport to recognize the configuration
require('../../config/passport') 

/**
 * Controller for OAuthentication via GitHub
 * 
 * See [[IController]] for more details.
 */
class AuthController implements BaseController {

  public path = authUrl.main
  public router = express.Router()

  /**
   * Constructor of AuthController
   */
  constructor() {
    this.initializeRoutes()
  }

  /**
   * Initialization of routes of AuthController
   * 
   * @private
   */
  private initializeRoutes = () => {
    this.router.get(this.path, passport.authenticate('github'))
    this.router.get(authUrl.callback,
      passport.authenticate('github'),
      this.success
    )
    this.router.get(authUrl.logout, this.logout)
  }

  /**
   * Sucess callback after authentication
   * 
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @private 
   */
  private success = (req ,res) => {
    res.redirect(successfulRedirectUrl)
  }

  /**
   * Logging out of a session
   * 
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @private
   */
  private logout = (req, res) => {
    req.session.destroy()
    res.clearCookie('user', { path: '/' }).status(200)
    res.redirect(successfulRedirectUrl)
  }

}

/**
 * Export AuthController
 */
export default AuthController
