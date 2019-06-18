import express from 'express'
import session from 'express-session'
import passport from 'passport'

import { sessionSecret } from '../config/index'

import Controller from './controllers/base'
import AuthController from './controllers/auth'
import MainController from './controllers/home';


/**
 * Configuration of the express application
 */
class App {
  
  public app: express.Application

  /**
   * Constructor to initialize application
   */
  constructor() {
    this.app = express()
    this.initializeMiddleWares()
    this.initializeControllers([
      new AuthController(),
      new MainController()
    ])
  }

  /**
   * Initializes middleware for accessing request and response objects
   * 
   * @private
   */
  private initializeMiddleWares() {
    // Configuration for creating session cookies
    this.app.use(session({
      key: 'user',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: true,
      // Cookie expires after 1 day
      cookie: { httpOnly: false, maxAge: 1 * 24 * 60 * 60 * 1000 },
    }))

    this.app.use(passport.initialize())
    this.app.use(passport.session())
  }

  /**
   * Sets routes for each controller
   * 
   * @param {Controller} controllers Array of controllers
   */
  private initializeControllers(controllers: Controller[]) {
    controllers.forEach(controller => {
      this.app.use('/', controller.router)
    })
  }

}

/**
 * Export instance of an express application
 */
export default new App().app
