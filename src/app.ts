import bodyParser from 'body-parser';
import connectRedis, { RedisStore } from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import redis from 'redis';
import {
  cookieExpiry,
  redisConfiguration,
  sessionSecret,
  allowedOrigins,
} from '../config/index';
import AuthController from './controllers/auth';
import Controller from './controllers/base';
import GistController from './controllers/gist';
import HomeController from './controllers/home';

/**
 * Configuration of the express application.
 */
class App {
  /**
   * Stores the constructor of Express application.
   */
  public app: express.Application;
  public redisClient: redis.RedisClient;
  public redisStore: RedisStore;

  /**
   * Constructor to initialize application.
   */
  constructor() {
    this.app = express();
    this.redisClient = redis.createClient(
      redisConfiguration.REDIS_PORT,
      redisConfiguration.REDIS_HOST
    );
    if (redisConfiguration.REDIS_PASSWORD) {
      this.redisClient.auth(redisConfiguration.REDIS_PASSWORD, error => {
        console.error(error);
      });
    }
    this.redisStore = connectRedis(session);
    this.initializeMiddleWares();
    this.initializeControllers([
      new AuthController(),
      new HomeController(),
      new GistController(),
    ]);
  }

  /**
   * Initializes middleware for accessing request and response objects.
   */
  private initializeMiddleWares() {
    // Configuration for creating session cookies.
    const redisStore = this.redisStore;
    this.app.use(
      session({
        name: 'vega_session',
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: new redisStore({
          host: redisConfiguration.REDIS_HOST,
          port: redisConfiguration.REDIS_PORT,
          client: this.redisClient,
          ttl: cookieExpiry,
        }),
        /**
         * `cookieExpiry` is converted to milliseconds. Reference:
         * https://www.npmjs.com/package/express-session#cookiemaxage
         */
        cookie: {
          maxAge: cookieExpiry * 1000,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'none',
        },
        rolling: true,
      })
    );
    this.app.use(bodyParser.json());

    const corsOptions = {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    };
    this.app.use(cors(corsOptions));
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    // Put IP of https://vega.github.io/editor instead of 1
    this.app.set('trust proxy', 1);

    this.app.engine('pug', require('pug').__express);
    this.app.set('views', `${__dirname}/views`);
    this.app.set('view engine', 'pug');
  }

  /**
   * Sets routes for each controller.
   *
   * @param {Controller} controllers Array of controllers
   */
  private initializeControllers(controllers: Controller[]) {
    for (const controller of controllers) {
      this.app.use('/', controller.router);
    }
  }
}

/**
 * _Exports an instance of Express application._
 */
export default new App().app;
