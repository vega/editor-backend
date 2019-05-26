import express, { Request, Response } from 'express'

import BaseController from './base'
import UserModel from '../models/user'

class UserController implements BaseController {

  public path = '/api/users'
  public router = express.Router()
  private user = UserModel

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.get(this.path, this.getAllUsers)
  }

  private getAllUsers = (req: Request, res: Response) => {
    this.user.find()
      .then((users) => {
        res.send(users)
      })  
  }
}

export default UserController
