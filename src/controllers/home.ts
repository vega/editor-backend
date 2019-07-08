import express from 'express'

import BaseController from './base'
import { authUrl, gistUrl } from '../urls'

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
    this.router.get(this.path, this.listRoutes)
  }

  /**
   * Displays welcome message.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @private
   */
  private listRoutes = (req, res) => {
    res.render('index', {
      authUrl,
      gistUrl,
      host: req.headers.host,
    })
  }

}

/**
 * _Export `HomeController`._
 */
export default HomeController
