import mongoose from 'mongoose';
export default function connect() {
  if (!process.env.MONGO_URL) {
    throw new Error(
      'Please define the MONGO_URL environment variable inside .env.local',
    );
  }
  mongoose.connect(process.env.MONGO_URL);
}
