import { UserModelT } from '@/schemas/user';
export type ISODateString = string;

declare module 'next-auth' {
  interface Session {
    user: Omit<UserModelT, 'password'>;
  }

  interface User {
    id: string;
    username: string;
  }
}
