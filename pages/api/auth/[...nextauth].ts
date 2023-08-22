import { UserModel, UserModelT } from '@/schemas/user';
import connect from '@/lib/mongo';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';

connect();

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
          const user = await UserModel.findOne({
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
  callbacks: {
    async session({ session, token, user }) {
      const found = await UserModel.findOne<UserModelT>({ _id: token.sub });
      if (!found) {
        throw new Error('User not found');
      }
      session.user = {
        username: found.username,
        admin: found.admin,
        _id: found._id.toString(),
      };
      return session; // The return type will match the one returned in `useSession()`
    },
  },
});
