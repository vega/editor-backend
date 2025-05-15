import express from 'express';
import fetch from 'isomorphic-fetch';
import { graphql } from '@octokit/graphql';
import crypto from 'crypto';

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
    this.router.options("*", this.handleOptions);
    this.router.get(gistUrl.allGists, this.fetchAllGistsofUser);
    this.router.post(gistUrl.createGist, this.createGist);
    this.router.post(gistUrl.updateGist, this.updateGist);
  };

  /**
   * Handle OPTIONS requests (CORS preflight)
   */
  private handleOptions = (req, res) => {
    const origin = req.headers.origin || '*';

    if (origin === 'null') {
      res.header('Access-Control-Allow-Origin', 'null');
    } else {
      res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Auth-Token, Cache-Control, Pragma, Expires');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Content-Type, Authorization, X-Auth-Token');
    res.status(200).end();
  };

  /**
   * Validate a token and extract user info
   * @param {string} token The token to validate
   * @returns {any} The user info if token is valid, null otherwise
   */
  private validateToken = (token: string): any => {
    if (!token) return null;

    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      const { data, signature } = decoded;

      const expectedSignature = crypto
        .createHmac('sha256', process.env.SESSION_SECRET || 'vega-editor-secret')
        .update(data)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid token signature');
        return null;
      }

      const userInfo = JSON.parse(data);

      const tokenAge = Date.now() - userInfo.timestamp;
      if (tokenAge > 7 * 24 * 60 * 60 * 1000) {
        console.error('Token expired');
        return null;
      }

      return {
        _json: {
          id: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          avatar_url: userInfo.avatar_url
        },
        username: userInfo.login,
        accessToken: userInfo.access_token
      };
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  };

  /**
   * Route to fetch all private and public gists of a user.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  private fetchAllGistsofUser = async (req, res) => {
    const origin = req.headers.origin || '*';
    if (origin === 'null') {
      res.header('Access-Control-Allow-Origin', 'null');
    } else {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Auth-Token');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Check for token-based authentication
    const authToken = req.headers['x-auth-token'] as string;
    let user = req.user;

    if (!user && authToken) {
      console.log('Received auth token for gist access:', authToken.substring(0, 10) + '...');
      user = this.validateToken(authToken);
      if (!user) {
        console.log('Token validation failed for gist access');
        return res.send({ isAuthenticated: false });
      }
    }

    if (!user) {
      return res.send({ isAuthenticated: false });
    }

    const username = user.username;
    const oauthToken = user.accessToken;
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
        i += paginationSize
      ) {
        if (i === 0) {
          cursors['init'] = filteredCursors[i].cursor;
        }
        else {
          cursors[i / paginationSize] = filteredCursors[i - 1].cursor;
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
  };

  /**
   * Route to create a gist.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  private createGist = (req, res) => {
    const origin = req.headers.origin || '*';
    if (origin === 'null') {
      res.header('Access-Control-Allow-Origin', 'null');
    } else {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Auth-Token');
    res.header('Access-Control-Allow-Credentials', 'true');

    const authToken = req.headers['x-auth-token'] as string;
    let user = req.user;

    if (!user && authToken) {
      console.log('Received auth token for gist creation:', authToken.substring(0, 10) + '...');
      user = this.validateToken(authToken);
      if (!user) {
        console.log('Token validation failed for gist creation');
        return res.send({ isAuthenticated: false });
      }
    }

    if (!user) {
      return res.send({ isAuthenticated: false });
    }

    const oauthToken = user.accessToken;
    const body = req.body as ICreateGist;
    const { content, privacy, title = '' } = body;
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
        res.status(201).send({ gistId: json.id, fileName: name });
      })
      .catch(error => {
        console.error(error);
        res.status(400).send('Gist could not be created');
      });
  };

  /**
   * Route to update a gist.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  private updateGist = (req, res) => {
    const origin = req.headers.origin || '*';
    if (origin === 'null') {
      res.header('Access-Control-Allow-Origin', 'null');
    } else {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Auth-Token');
    res.header('Access-Control-Allow-Credentials', 'true');

    const authToken = req.headers['x-auth-token'] as string;
    let user = req.user;

    if (!user && authToken) {
      console.log('Received auth token for gist update:', authToken.substring(0, 10) + '...');
      user = this.validateToken(authToken);
      if (!user) {
        console.log('Token validation failed for gist update');
        return res.send({ isAuthenticated: false });
      }
    }

    if (!user) {
      return res.send({ isAuthenticated: false });
    }

    const oauthToken = user.accessToken;
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
