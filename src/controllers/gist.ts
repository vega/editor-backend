import express from 'express'
import graphql from '@octokit/graphql'

import BaseController from './base'
import { gistUrl, successfulRedirectUrl } from '../urls'

/**
 * Controller for interacting via GitHub Gist API.
 *
 * See [[IBaseController]] for more details.
 */
class GistController implements BaseController {

  public path = gistUrl.main

  public router = express.Router()

  /**
   * Constructor of `GistController`.
   */
  constructor() {
    this.initializeRoutes()
  }

  /**
   * Initialization of routes of `GistController`.
   *
   * @private
   */
  private initializeRoutes = () => {
    this.router.get(gistUrl.allGists, this.fetchAllGistsofUser)

  }

  /**
   * Route to fetch all private and public gists of a user.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @private
   */
  public fetchAllGistsofUser = async (req, res) => {
    if (req.user === undefined) {
      res.redirect(successfulRedirectUrl)
    }
    else {
      const username = req.user.username
      const oauthToken = req.user.accessToken
      const data = await graphql(`{
        user(login: "${username}") {
          gists(first: 20, privacy: ALL) {
            nodes {
              files {
                name
                extension
                text
              }
              isPublic
            }
          }
        }
      }`, {
        headers: {
          authorization: `token ${oauthToken}`,
        },
      })
      res.send(data.user.gists.nodes)
    }
  }
}

/**
 * _Export `GistController`._
 */
export default GistController
