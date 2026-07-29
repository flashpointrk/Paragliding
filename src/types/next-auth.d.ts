import type { DefaultSession, DefaultUser } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';

/**
 * NextAuth type extensions.
 * Adds the `role` field to the JWT token and to session.user.
 */

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'OPERATOR';
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: 'ADMIN' | 'OPERATOR';
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: 'ADMIN' | 'OPERATOR';
  }
}
