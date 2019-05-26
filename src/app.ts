import express from 'express'
import mongoose from 'mongoose'

import URL from '../config/db'

class App {

  constructor() {
    this.app = express()
    this.connectDatabase(URL)
  }

  public app: express.Application

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
