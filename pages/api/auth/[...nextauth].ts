import { UserModel, UserModelT } from '@/schemas/user';
import connect from '@/lib/mongo';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcrypt';
connect();

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    Credentials({
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
          if (
            user &&
            user?.password &&
            (await compare(credentials.password, user.password))
          ) {
            return {
              id: user._id,
              _id: user._id,
              username: user.username,
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        if (profile?.email && profile?.sub) {
          const user = await UserModel.findOne({
            username: profile.email,
          });
          if (user) {
            return true;
          } else {
            await UserModel.create({
              username: profile?.email,
              admin: false,
            });
            return true;
          }
        }
      }
      return true; // Do different verification for other providers that don't have `email_verified`
    },
    async session({ session, token, user }) {
      const query = token.email
        ? { username: token.email }
        : { _id: token.sub };
      const found = await UserModel.findOne<UserModelT & { _id: string }>(
        query,
      );
      if (!found) {
        throw new Error('User not found');
      }
      session.user = {
        username: found.username,
        admin: found.admin,
        _id: found._id.toString(),
      };
      return session;
    },
  },
});
