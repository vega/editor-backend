import express from 'express';
import fetch from 'isomorphic-fetch';
import { graphql } from '@octokit/graphql';

import BaseController from './base';
import { gistUrl, redirectUrl, gistRawUrl } from '../urls';
import { paginationSize, IGetGist, ICreateGist } from '../consts';


/**
 * Controller for interacting via GitHub Gist API.
 *
 * See [[IBaseController]] for more details.
 */
class GistController implements BaseController {

  public path = gistUrl.main;

  public router = express.Router();

  /**
   * Constructor of `GistController`.
   */
  constructor() {
    this.initializeRoutes();
  }

  /**
   * Initialization of routes of `GistController`.
   */
  private initializeRoutes = () => {
    this.router.get(gistUrl.allGists, this.fetchAllGistsofUser);
    this.router.post(gistUrl.createGist, this.createGist);
    this.router.post(gistUrl.updateGist, this.updateGist);
  };

  /**
   * Route to fetch all private and public gists of a user.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  private fetchAllGistsofUser = async (req, res) => {
    if (req.user === undefined) {
      res.redirect(redirectUrl.failure);
    }
    else {
      const username = req.user.username;
      const oauthToken = req.user.accessToken;
      if (req.query.cursor === undefined || req.query.privacy === undefined) {
        res.sendStatus(400);
      }
      else if (req.query.cursor === 'init') {
        const response: IGetGist = await graphql(`
        query response($privacy: GistPrivacy!, $username: String!) {
          user(login: $username) {
            gists(
              first: 100,
              privacy: $privacy,
              orderBy:
                {field: CREATED_AT, direction: DESC}
            ) {
              edges {
                cursor
                node {
                  files {
                    extension
                  }
                }
              }
              nodes {
                name
                description
                files(limit: 300) {
                  name
                  extension
                  isImage
                }
                isPublic
              }
            }
          }
        }`, {
          privacy: req.query.privacy,
          username: username,
          headers: {
            authorization: `token ${oauthToken}`,
          },
        });
        const cursors = {};
        const filteredCursors = response.user.gists.edges.filter(cursor => (
          cursor.node.files.some(file => file.extension === '.json')
        ));
        for (
          let i = 0;
          i < filteredCursors.length;
          i+=paginationSize
        ) {
          if (i === 0) {
            cursors['init'] = filteredCursors[i].cursor;
          }
          else {
            cursors[i/paginationSize] = filteredCursors[i-1].cursor;
          }
        }
        const initialData = GistController.sanitize(
          response.user.gists.nodes, username
        );
        res.send({
          cursors: cursors,
          data: initialData,
        });
      }
      else {
        try {
          const response: IGetGist = await graphql(`
          query response(
            $cursor: String!, $privacy: GistPrivacy!, $username: String!
          ) {
            user(login: $username) {
              gists(
                first: 100,
                after: $cursor,
                privacy: $privacy,
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
            cursor: req.query.cursor,
            privacy: req.query.privacy,
            username: username,
            headers: {
              authorization: `token ${oauthToken}`,
            },
          });
          res.send({
            data: GistController.sanitize(response.user.gists.nodes, username),
          });
        }
        catch (error) {
          res.sendStatus(404);
        }
      }
    }
  };

  /**
   * Route to create a gist.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  private createGist = (req, res) => {
    if (req.user === undefined) {
      res.redirect(redirectUrl.failure);
    }
    else {
      const oauthToken = req.user.accessToken;
      const body = req.body as ICreateGist;
      const { content, privacy, title='' } = body;
      let name = body.name;
      if (!name.endsWith('.json')) {
        name = `${name}.json`;
      }
      fetch('https://api.github.com/gists', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${oauthToken}`,
        },
        body: JSON.stringify({
          description: title,
          public: !privacy,
          files: {
            [name]: {
              content,
            },
          },
        }),
      })
        .then(res => res.json())
        .then(json => {
          res.status(201).send({ gistId: json.id, fileName: name }); })
        .catch(error => {
          console.error(error);
          res.status(400).send('Gist could not be created');
        });
    }
  };

  /**
   * Route to update a gist.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  private updateGist = (req, res) => {
    if (req.user === undefined) {
      res.redirect(redirectUrl.failure);
    }
    else {
      const oauthToken = req.user.accessToken;
      const body = req.body;
      const { gistId, content, fileName } = body;
      fetch(
        `https://api.github.com/gists/${gistId}`,
        {
          method: 'patch',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${oauthToken}`,
          },
          body: JSON.stringify({
            files: {
              [fileName]: {
                content: content,
              },
            },
          }),
        })
        .then(res => res.json())
        .then(json => {
          res.status(205).send({ gistId: json.id, fileName: fileName });
        })
        .catch(error => {
          console.error(error);
          res.status(400).send(`${gistId} could not be updated`);
        });
    }
  };

  /**
   * Static method to sanitize the output fetched by GitHub gist API.
   *
   * @param {Array} data Array of gists
   * @param {string} username Name of gist creator
   */
  private static sanitize = (data, username: string) => {
    const gists = data.filter(gist =>
      gist.files.some(file => file.extension === '.json')
    ).slice(0, paginationSize);
    gists.forEach(gist => {
      gist.spec = [];
      gist.files.forEach(file => {
        if (file.extension === '.json') {
          const spec = {
            name: '',
            previewUrl: '',
          };
          const name = file.name.split('.')[0];
          spec.name = file.name;
          gist.files.forEach(image => {
            if (image.isImage && image.name.split('.')[0] === name) {
              spec.previewUrl = GistController.specUrlGenerator(
                image.name, gist.name, username
              );
            }
          });
          gist.spec.push(spec);
        }
      });
      gist.title = gist.description;
      delete gist.files;
      delete gist.description;
    });
    return gists;
  };

  /**
   * Static method to generate raw URL
   *
   * @param {string} fileName Name of file
   * @param {string} gistId ID of gist
   * @param {string} username Name of gist creator
   */
  private static specUrlGenerator =
    (fileName: string, gistId: string, username: string) => {
      return `${gistRawUrl}/${username}/${gistId}/raw/${fileName}`;
    };

}

/**
 * _Export `GistController`._
 */
export default GistController;
