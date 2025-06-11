import cors from 'cors';
import express from 'express';
import passport from 'passport';
import {
  allowedOrigins,
} from '../config/index.js';
import AuthController from './controllers/auth.js';
import Controller from './controllers/base.js';
import HomeController from './controllers/home.js';

/**
 * Configuration of the express application.
 */
class App {
  /**
   * Stores the constructor of Express application.
   */
  public app: express.Application;

  //needed to access controller methods
  private authController: AuthController;

  /**
   * Constructor to initialize application.
   */
  constructor() {
    this.app = express();
    this.authController = new AuthController();
    this.initializeMiddleWares();
    this.initializeControllers([
      this.authController,
      new HomeController(),
    ]);
  }

  /**
   * Initializes middleware for accessing request and response objects.
   */
  private initializeMiddleWares() {
    this.app.use(express.json());

    const corsOptions = {
      origin: (origin, callback) => {
        if (!origin || origin === 'null' || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
    };
    this.app.use(cors(corsOptions));
    this.app.use(passport.initialize());
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
