import { createUser, getUserById, getUserByUsername } from '@/schemas/user';
import { compare } from 'bcrypt';
import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
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
      async authorize(credentials) {
        if (credentials?.username && credentials.password) {
          const user = await getUserByUsername(credentials.username);
          if (
            user?.password &&
            (await compare(credentials.password, user.password))
          ) {
            return { id: user.id, username: user.username };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google' && profile?.email && profile.sub) {
        const user = await getUserByUsername(profile.email);
        if (!user) {
          await createUser({ username: profile.email, admin: false });
        }
      }
      return true;
    },
    async session({ session, token }) {
      const found = token.email
        ? await getUserByUsername(token.email)
        : token.sub
          ? await getUserById(token.sub)
          : null;
      if (!found) throw new Error('User not found');
      session.user = {
        username: found.username,
        admin: found.admin,
        id: found.id,
        created: found.created,
        updated: found.updated,
      };
      return session;
    },
  },
};
