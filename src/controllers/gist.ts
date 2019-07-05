import express from 'express'
import fetch from 'isomorphic-fetch'

import BaseController from './base'
import { githubGistApiUrl, gistUrl, successfulRedirectUrl } from '../urls'

class GistController implements BaseController {

  public path = gistUrl.main

  public router = express.Router()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes = () => {
    this.router.get(gistUrl.allGists, this.fetchAllGistsofUser)

  }

  private fetchAllGistsofUser = (req, res) => {
    if (req.user === undefined) {
      res.redirect(successfulRedirectUrl)
    }
    else {
      const requiredFields = ['files', 'public']
      const username = req.user.username
      const oauthToken = req.user.accessToken
      fetch(
        `${githubGistApiUrl}/users/${username}/gists?oauth_token=${oauthToken}`
      )
        .then(response => response.json())
        .then(data => {
          let requiredData = []
          for (const gist of data) {
            let requiredObj = {}
            for (const field of requiredFields) {
              requiredObj = {
                ...requiredObj,
                [field]: gist[field],
              }
            }
            requiredData = [...requiredData, requiredObj]
          }
          res.send(requiredData)
        })
    }
  }
}

export default GistController
