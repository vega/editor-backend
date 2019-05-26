import express from 'express'
import mongoose from 'mongoose'

import URL from '../config/db'
import Controller from './controllers/base'
import UserController from './controllers/user'

class App {

  constructor() {
    this.app = express()
    this.connectDatabase(URL)
    this.initializeControllers([
      new UserController(),
    ])
  }

  public app: express.Application

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach(controller => {
      this.app.use('/', controller.router)
    })
  }

  private connectDatabase(URL: string): void {
    mongoose.connect(URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
    }).then(
      () => console.log('Database connection established'),
      error => console.error(error)
    )
  }
}

export default new App().app
