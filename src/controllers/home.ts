import express from 'express'

import BaseController from './base'

/**
 * See [[IController]] for more details.
 */
class HomeController implements BaseController {

  public path = '/'

  public router = express.Router()

  /**
   * Constructor of HomeController
   */
  constructor() {
    this.initializeRoutes()
  }

  /**
   * Initialization of routes of HomeController
   *
   * @private
   */
  private initializeRoutes = () => {
    this.router.get(this.path, this.helloWorld)
  }

  /**
   * Welcome message!
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
 * Export HomeController
 */
export default HomeController
