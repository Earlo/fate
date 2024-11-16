import { ReplaceMongooseDocumentArrayByArray } from '@/lib/mongo';
import mongoose, { InferSchemaType, Schema, model } from 'mongoose';

export const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String },
  admin: { type: Boolean, required: true, default: false },
  created: { type: Date, required: false, default: Date.now },
  updated: { type: Date, required: false, default: Date.now },
});

export const UserModel = mongoose.models.User || model('User', userSchema);
export type UserModelT = {
  _id: string;
} & ReplaceMongooseDocumentArrayByArray<InferSchemaType<typeof userSchema>>;
