import { Document, Schema, model, Model } from 'mongoose'

interface IUser extends Document {
  handle: string;
  userId: string; 
}

export const UserSchema: Schema = new Schema({
  handle: String,
  userId: { type: String, unique: true },
})

UserSchema.pre('save', next => {
  if (!this.createdAt) {
    this.createdAt = new Date()
  }
  next()
})

const UserModel: Model<IUser> = model<IUser>('User', UserSchema)

export default UserModel
