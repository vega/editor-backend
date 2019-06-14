import express from 'express'
import session from 'express-session'
import passport from 'passport'
import cors from 'cors'

import { sessionSecret } from '../config/index'

import Controller from './controllers/base'
import AuthController from './controllers/auth'


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
      key: 'vegasessid',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: true,
      // Cookie expires after 1 day
      cookie: { httpOnly: false, maxAge: 1 * 24 * 60 * 60 * 1000 },
    }))

    // Arrays of domains allowed
    const whitelist = [
      'http://localhost:8081',
      'http://localhost:8080',
    ]
    const corsOptions = {
      origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      credentials: true,
    }
    this.app.use(cors(corsOptions))
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
