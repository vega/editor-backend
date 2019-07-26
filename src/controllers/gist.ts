import express from 'express'
import graphql from '@octokit/graphql'

import BaseController from './base'
import { gistUrl, redirectUrl, gistRawUrl } from '../urls'

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
  private fetchAllGistsofUser = async (req, res) => {
    if (req.user === undefined) {
      res.redirect(redirectUrl.failure)
    }
    else {
      const username = req.user.username
      const oauthToken = req.user.accessToken
      let data = await graphql(`{
        user(login: "${username}") {
          gists(first: 20, privacy: ALL) {
            nodes {
              name
              description
              files {
                name
                extension
                isImage
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

      const schema = {
        vega: 'https://vega.github.io/schema/vega/v5.json',
        'vega-lite': 'https://vega.github.io/schema/vega-lite/v3.json',
      }
      data = data.user.gists.nodes.filter(gist =>
        gist.files.some(file => {
          if (file.extension === '.json') {
            const spec = JSON.parse(file.text)
            if (Object.values(schema).includes(spec['$schema'])) {
              gist.type = Object.keys(schema).find(
                key => spec['$schema'] === schema[key]
              )
              return true
            }
          }
        })
      )
      data.forEach(gist => {
        gist.files.map(file => {
          if (file.extension === '.json') {
            gist.specUrl =
              GistController.specUrlGenerator(file.name, gist.name, username)
          }
          else if (file.isImage) {
            gist.imageUrl =
              GistController.specUrlGenerator(file.name, gist.name, username)
          }
        })
        gist.title = gist.description
        gist.imageUrl = gist.imageUrl === undefined ? '' : gist.imageUrl
        delete gist.files
        delete gist.description
      })
      res.send(data)
    }
  }

  /**
   * Static method to generate raw URL
   *
   * @param {string} fileName Name of file
   * @param {string} gistId ID of gist
   * @param {string} username Name of gist creator
   * @private
   * @static
   */
  private static specUrlGenerator =
  (fileName: string, gistId: string, username: string) => {
    return `${gistRawUrl}/${username}/${gistId}/raw/${fileName}`
  }

}

/**
 * _Export `GistController`._
 */
export default GistController
