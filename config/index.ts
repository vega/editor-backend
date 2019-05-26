import dotenv from 'dotenv'

dotenv.config()

export const server: any = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
}

export const database: any = {
  MONGO_USERNAME: process.env.MONGO_USERNAME,
  MONGO_PASSWORD: process.env.MONGO_PASSWORD,
  MONGO_HOSTNAME: process.env.MONGO_HOSTNAME,
  MONGO_PORT: process.env.MONGO_PORT,
  MONGO_DB: process.env.MONGO_DB,
}
