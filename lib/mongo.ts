import mongoose from 'mongoose';
export default function connect() {
  if (!process.env.MONGO_URL) {
    throw new Error(
      'Please define the MONGO_URL environment variable inside .env.local',
    );
  }
  mongoose.connect(process.env.MONGO_URL);
}

// Mongoose was a mistake.
export type ReplaceMongooseDocumentArrayByArray<
  // typescript allow any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MySchema extends Record<string, any>,
> = {
  [K in keyof MySchema]: MySchema[K] extends mongoose.Types.DocumentArray<
    infer ArrayType
  >
    ? ReplaceMongooseDocumentArrayByArray<
        Omit<ArrayType, keyof mongoose.Types.Subdocument>
      >[]
    : MySchema[K] extends
          | number
          | string
          | boolean
          | Date
          | mongoose.Schema.Types.ObjectId
          | mongoose.Types.ObjectId
      ? MySchema[K]
      : ReplaceMongooseDocumentArrayByArray<MySchema[K]>;
};
