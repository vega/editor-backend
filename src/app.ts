import express from 'express'
import session from 'express-session'
import passport from 'passport'
import cors from 'cors'

import { sessionSecret, whitelist, cookieExpiry } from '../config/index'

import Controller from './controllers/base'
import AuthController from './controllers/auth'
import HomeController from './controllers/home'
import GistController from './controllers/gist'


/**
 * Configuration of the express application.
 */
class App {

  /**
   * Stores the constructor of Express application.
   */
  public app: express.Application

  /**
   * Constructor to initialize application.
   */
  constructor() {
    this.app = express()
    this.initializeMiddleWares()
    this.initializeControllers([
      new AuthController(),
      new HomeController(),
      new GistController(),
    ])
  }

  /**
   * Initializes middleware for accessing request and response objects.
   */
  private initializeMiddleWares() {
    // Configuration for creating session cookies.
    this.app.use(session({
      key: 'vega_session',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: true,
      // Cookie expires after 1 month
      cookie: { httpOnly: false, maxAge: cookieExpiry },
    }))

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

    this.app.engine('pug', require('pug').__express)
    this.app.set('views', __dirname + '/views')
    this.app.set('view engine', 'pug')
  }

  /**
   * Sets routes for each controller.
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
 * _Exports an instance of Express application._
 */
export default new App().app
