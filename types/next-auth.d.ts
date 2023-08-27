import { UserModelT } from '@/schemas/user';
export type ISODateString = string;

declare module 'next-auth' {
  interface Session {
    user: Omit<UserModelT, 'password'>;
  }
  interface DefaultUser {
    _id: string;
    username: string;
  }

  interface User {
    _id: string;
    username: string;
  }
}
