import { createUser, getUserById, getUserByUsername } from '@/schemas/user';
import { compare } from 'bcrypt';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
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
          const user = await getUserByUsername(credentials.username);
          if (
            user &&
            user.password &&
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
          const user = await getUserByUsername(profile.email);
          if (!user) {
            await createUser({
              username: profile.email,
              admin: false,
            });
          }
          return true;
        }
      }
      return true; // Do different verification for other providers that don't have `email_verified`
    },
    async session({ session, token }) {
      const found = token.email
        ? await getUserByUsername(token.email)
        : token.sub
          ? await getUserById(token.sub)
          : null;
      if (!found) {
        throw new Error('User not found');
      }
      session.user = {
        username: found.username,
        admin: found.admin,
        _id: found._id.toString(),
        created: found.created,
        updated: found.updated,
      };
      return session;
    },
  },
});

export { handler as GET, handler as POST };
