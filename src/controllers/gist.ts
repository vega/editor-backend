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
   */
  private initializeRoutes = () => {
    this.router.get(gistUrl.allGists, this.fetchAllGistsofUser)

  }

  /**
   * Route to fetch all private and public gists of a user.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
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

      data = data.user.gists.nodes.filter(gist =>
        gist.files.some(file => file.extension === '.json')
      )
      data.forEach(gist => {
        gist.spec = []
        gist.files.forEach(file => {
          if (file.extension === '.json') {
            const spec = {
              name: '',
              previewUrl: '',
              rawUrl: '',
            }
            const name = file.name.split('.')[0]
            spec.name = file.name
            spec.rawUrl =
              GistController.specUrlGenerator(file.name, gist.name, username)
            gist.files.forEach(image => {
              if (image.isImage && image.name.split('.')[0] === name) {
                spec.previewUrl = GistController.specUrlGenerator(
                  image.name, gist.name, username
                )
              }
            })
            gist.spec.push(spec)
          }
        })
        gist.title = gist.description
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
