import mongoose, { Schema, model, InferSchemaType } from 'mongoose';

export const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  admin: { type: Boolean, required: true, default: false },
});

export const UserModel = mongoose.models.User || model('User', userSchema);
export type UserModelT = {
  _id: string;
} & InferSchemaType<typeof userSchema>;
