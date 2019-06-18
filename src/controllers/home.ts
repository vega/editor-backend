import express from 'express'

import BaseController from './base'

/**
 * See [[IController]] for more details.
 */
class MainController implements BaseController {

  public path = '/'

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
    this.router.get(this.path, this.helloWorld)
  }

  /**
   * Sucess callback after authentication
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @private
   */
  private helloWorld = (req, res) => {
    res.send('Hello World')
  }

}

/**
 * Export AuthController
 */
export default MainController
