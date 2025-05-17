import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import passport from 'passport';
import {
  allowedOrigins,
} from '../config/index';
import AuthController from './controllers/auth';
import Controller from './controllers/base';
import HomeController from './controllers/home';

/**
 * Configuration of the express application.
 */
class App {
  /**
   * Stores the constructor of Express application.
   */
  public app: express.Application;

  /**
   * Constructor to initialize application.
   */
  constructor() {
    this.app = express();
    this.initializeMiddleWares();
    this.initializeControllers([
      new AuthController(),
      new HomeController()
    ]);
  }

  /**
   * Initializes middleware for accessing request and response objects.
   */
  private initializeMiddleWares() {
    this.app.use(bodyParser.json());

    const corsOptions = {
      origin: (origin, callback) => {
        if (!origin || origin === 'null' || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    };
    this.app.use(cors(corsOptions));
    this.app.use(passport.initialize());

    // Handle preflight OPTIONS requests explicitly (required for CORS)
    this.app.options('*', (req, res) => {
      const origin = req.headers.origin || '*';

      if (origin === 'null') {
        res.header('Access-Control-Allow-Origin', 'null');
      } else {
        res.header('Access-Control-Allow-Origin', origin);
      }

      // Needed to handle CORS preflight requests. 
      // i.e. tell browsers which origins, methods, are allowed.


      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Auth-Token, Cache-Control, Pragma, Expires');
      // Without this, browsers may block cross-origin requests, especially when credentials are involved.
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Expose-Headers', 'Content-Type, Authorization, X-Auth-Token');
      res.status(200).end();
    });

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
