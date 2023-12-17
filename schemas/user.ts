import { ReplaceMongooseDocumentArrayByArray } from '@/lib/mongo';
import mongoose, { Schema, model, InferSchemaType } from 'mongoose';

export const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String },
  admin: { type: Boolean, required: true, default: false },
});

export const UserModel = mongoose.models.User || model('User', userSchema);
export type UserModelT = {
  _id: string;
} & ReplaceMongooseDocumentArrayByArray<InferSchemaType<typeof userSchema>>;
