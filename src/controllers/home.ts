import express from 'express';

import BaseController from './base.js';
import { authUrl, docsUrl } from '../urls.js';

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
    const host = req.headers.host;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Editor Backend</title>
    <style>
        body { font-family: sans-serif; margin: 20px; }
        .token { background: #f0f0f0; padding: 10px; word-break: break-all; margin: 10px 0; }
        .result { background: #e0ffe0; padding: 10px; margin: 10px 0; word-break: break-all; }
        .result pre { white-space: pre-wrap; }
        .debug-section { border: 1px solid #ccc; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <h2>Welcome to editor-backend!</h2>
    <p>Here is the list of routes available in this project.</p>
    <ul>
        <li>Log in: <a href="${authUrl.main}">${host}${authUrl.main}</a></li>
        <li>Log out: <a href="${authUrl.logout}">${host}${authUrl.logout}</a></li>
        <li>Vega Editor API documentation: <a href="${docsUrl}">${docsUrl}</a></li>
    </ul>
    
    <div class="debug-section">
        <h3>Current Auth Token:</h3>
        <div class="token" id="token">Loading...</div>
        
        <h3>Auth Check Result:</h3>
        <div class="result" id="result">Loading...</div>
    </div>

    <script>
        const token = localStorage.getItem('vega_editor_auth_token');
        document.getElementById('token').textContent = token || 'No token found';
        
        if (token) {
            fetch('/auth/github/check', {
                headers: {
                    'X-Auth-Token': token
                }
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            })
            .catch(error => {
                document.getElementById('result').textContent = 'Error: ' + error.message;
            });
        } else {
            document.getElementById('result').textContent = 'No token available to test';
        }
    </script>
</body>
</html>`;

    res.send(html);
  };

}

/**
 * _Export `HomeController`._
 */
export default HomeController;
