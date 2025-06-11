import express from 'express';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import BaseController from './base.js';
import { authUrl, docsUrl } from '../urls.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Controller to serve the root URL of back-end service.
 *
 * See [[IBaseController]] for more details.
 */
class HomeController implements BaseController {

  public path = '/';

  public router = express.Router();

  /**
   * Constructor of `HomeController`.
   */
  constructor() {
    this.initializeRoutes();
  }

  /**
   * Initialization of routes of `HomeController`.
   */
  private initializeRoutes = () => {
    this.router.get(this.path, this.listRoutes);
  };

  /**
   * Displays welcome message.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  private listRoutes = (req, res) => {
    try {
      const htmlPath = join(__dirname, '../views/index.html');
      let html = readFileSync(htmlPath, 'utf8');

      const serverData = {
        authUrl,
        host: req.headers.host,
        docsUrl,
      };

      const dataScript = `<script>window.SERVER_DATA = ${JSON.stringify(serverData)};</script>`;
      html = html.replace('<!-- Server data will be injected here -->', dataScript);

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('HTML Template Error:', error);
    }
  };

}

/**
 * _Export `HomeController`._
 */
export default HomeController;
