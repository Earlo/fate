export type ISODateString = string;

declare module 'next-auth' {
  interface Session {
    user: {
      username: string;
    };
  }

  interface User {
    id: string;
    username: string;
  }
}
