import { UserModel } from '@/schemas/user';
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
          // Find user by username
          const user = await UserModel.findOne({
            username: credentials.username,
          });

          // Check if user exists and password is correct
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
