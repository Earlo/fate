import { client } from '@/utils/mongo';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ObjectId } from 'mongodb';
import { compare } from 'bcrypt';

interface User {
  _id: ObjectId;
  username: string;
  password: string;
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Username and Password',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (credentials && credentials.username && credentials.password) {
          await client.connect();
          const db = client.db('fate');
          const usersCollection = db.collection<User>('users');

          const user = await usersCollection.findOne({
            username: credentials.username,
          });

          if (user && (await compare(credentials.password, user.password))) {
            return {
              id: user._id.toString(),
              username: user.username,
            };
          }
        }
        return null;
      },
    }),
  ],
});
