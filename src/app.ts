import express from 'express'
import session from 'express-session'
import redis from 'redis'
import connectRedis, { RedisStore } from 'connect-redis'
import bodyParser from 'body-parser'
import passport from 'passport'
import cors from 'cors'

import {
  sessionSecret,
  whitelist,
  cookieExpiry,
  redisConfiguration,
} from '../config/index'

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
  public redisClient: redis.RedisClient
  public redisStore: RedisStore

  /**
   * Constructor to initialize application.
   */
  constructor() {
    this.app = express()
    this.redisClient = redis.createClient(
      redisConfiguration.REDIS_PORT,
      redisConfiguration.REDIS_HOST,
    )
    this.redisClient.auth(redisConfiguration.REDIS_PASSWORD, error => {
      console.error(error)
    })
    this.redisStore = connectRedis(session)
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
    const redisStore = this.redisStore
    this.app.use(session({
      name: 'vega_session',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: true,
      store: new redisStore({
        host: redisConfiguration.REDIS_HOST,
        port: redisConfiguration.REDIS_PORT,
        client: this.redisClient,
        ttl: cookieExpiry,
      }),
    }))
    this.app.use(bodyParser.json())

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
