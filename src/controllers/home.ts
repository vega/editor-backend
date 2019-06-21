import express from 'express'

import BaseController from './base'

/**
 * Controller to serve the root URL of back-end service.
 *
 * See [[IBaseController]] for more details.
 */
class HomeController implements BaseController {

  public path = '/'

  public router = express.Router()

  /**
   * Constructor of `HomeController`.
   */
  constructor() {
    this.initializeRoutes()
  }

  /**
   * Initialization of routes of `HomeController`.
   *
   * @private
   */
  private initializeRoutes = () => {
    this.router.get(this.path, this.helloWorld)
  }

  /**
   * Displays welcome message.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @private
   */
  private helloWorld = (_, res) => {
    console.log(__dirname)
    res.send('Hello World')
  }

}

/**
 * _Export `HomeController`._
 */
export default HomeController
