import express from 'express'
import fetch from 'isomorphic-fetch'
import { graphql } from '@octokit/graphql'

import BaseController from './base'
import { gistUrl, redirectUrl, gistRawUrl } from '../urls'

/**
 * Interface for defining structure of a received POST request
 */
interface ICreateGist {
  content: string;
  name: string;
  privacy: boolean;
  title?: string;
}

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
    this.router.post(gistUrl.createGist, this.createGist)
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
      const response: any = await graphql(`{
        user(login: "${username}") {
          gists(
            first: 20,
            privacy: ALL,
            orderBy: 
              {field: CREATED_AT, direction: DESC}
          ) {
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

      const data = response.user.gists.nodes.filter(gist =>
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
   * Route to create a gist.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  private createGist = (req, res) => {
    if (req.user === undefined) {
      res.redirect(redirectUrl.failure)
    }
    else {
      const oauthToken = req.user.accessToken
      const body = req.body as ICreateGist
      const { content, name, privacy, title='' } = body
      fetch(`https://api.github.com/gists?oauth_token=${oauthToken}`, {
        method: 'post',
        header: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: title,
          public: !privacy,
          files: {
            [`${name}.json`]: {
              content,
            },
          },
        }),
      })
        .then(res => res.json())
        .then(json => res.send(201))
        .catch(error => {
          console.error(error)
          res.send(400)
        })
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
