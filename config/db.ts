import { database as db } from './index'

export default 'mongodb://' +
  `${db.MONGO_USERNAME}:${db.MONGO_PASSWORD}@` +
  `${db.MONGO_HOSTNAME}:${db.MONGO_PORT}/` +
  `${db.MONGO_DB}?authSource=admin`
