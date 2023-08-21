import { RegistrationInput } from '@/types/api/register';
export type ISODateString = string;

declare module 'next-auth' {
  export interface Session extends DefaultSession {
    user: RegistrationInput;
  }
}
