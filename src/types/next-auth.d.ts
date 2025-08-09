import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user?: {
      id: string;
      tag: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        tag: string;
    }
}