import mongoose, { Schema, model } from 'mongoose';

export const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

export const UserModel = mongoose.models.User || model('User', userSchema);
