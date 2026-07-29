import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  ipAl,
  recordLoginAttempt,
  isLoginLocked,
  IP_UNKNOWN,
} from '@/lib/auth-security';

/** Known dangerous values used to detect a placeholder secret. */
const SECRET_PLACEHOLDER_VALUES = new Set<string>([
  'replace-me-with-a-real-secret',
  'degistir-beni',
  'changeme',
  'secret',
  '',
]);

/**
 * Validates the NextAuth secret.
 *
 * In production (`NODE_ENV === 'production'`) a missing secret, or one that
 * matches a placeholder, throws. That stops a deployment from going live with
 * the template `.env` copied verbatim.
 */
function validateNextAuthSecret(): void {
  const secret = process.env.NEXTAUTH_SECRET;
  if (
    process.env.NODE_ENV === 'production' &&
    (!secret || SECRET_PLACEHOLDER_VALUES.has(secret.trim().toLowerCase()))
  ) {
    throw new Error(
      'NEXTAUTH_SECRET must be set in production. Generate one with: openssl rand -base64 32'
    );
  }
}

/**
 * NextAuth configuration.
 *
 * - Credentials provider (e-mail + password, verified with bcrypt)
 * - JWT-based sessions
 * - The role (ADMIN / OPERATOR) is written into both the token and the session
 * - Brute-force protection (per e-mail and IP: 5 attempts / 15 min / 15 min lock)
 * - Hardened cookies (httpOnly + sameSite=lax + secure in production)
 *
 * Exported as `getAuthOptions()` because `next-auth` is reached in different
 * ways from route handlers and server components.
 */
export function getAuthOptions(): NextAuthOptions {
  // Validate the secret in production — fail loudly at start-up.
  validateNextAuthSecret();

  const secure = process.env.NODE_ENV === 'production';

  return {
    session: {
      strategy: 'jwt',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    pages: {
      signIn: '/login',
      error: '/login',
    },
    providers: [
      CredentialsProvider({
        name: 'Kimlik Bilgileri',
        credentials: {
          email: { label: 'E-posta', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          // --- Brute-force protection: resolve the IP and check the lock ---
          const ip = await ipAl();
          const email = (credentials?.email ?? '').trim().toLowerCase();

          if (email && ip !== IP_UNKNOWN) {
            const lock = await isLoginLocked(email, ip);
            if (lock.locked) {
              // Locked: do NOT record the attempt (so the lock cannot extend forever),
              // just return null and let NextAuth produce its generic error.
              return null;
            }
          }

          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });

          // Decide the outcome of the check
          let successful = false;
          let result: {
            id: string;
            name?: string;
            email: string;
            role: 'ADMIN' | 'OPERATOR';
          } | null = null;

          if (user && user.passwordHash) {
            const valid = await bcrypt.compare(
              credentials.password,
              user.passwordHash
            );
            if (valid) {
              successful = true;
              result = {
                id: user.id,
                name: user.name ?? undefined,
                email: user.email,
                // The role is attached here so the next-auth type can carry it
                role: user.role,
              };
            }
          }

          // Record the attempt either way (brute-force tracking).
          await recordLoginAttempt(email, ip, successful);

          return result;
        },
      }),
    ],
    cookies: {
      sessionToken: {
        name: `next-auth.session-token`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure,
        },
      },
      csrfToken: {
        name: `next-auth.csrf-token`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure,
        },
      },
      callbackUrl: {
        name: `next-auth.callback-url`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure,
        },
      },
      pkceCodeVerifier: {
        name: `next-auth.pkce.code_verifier`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure,
        },
      },
    },
    callbacks: {
      // Write the role into the JWT
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          // The role reaches the user object from `authorize` (the type extension
          // in src/types/next-auth.d.ts declares it as 'ADMIN' | 'OPERATOR')
          token.role = (user.role ?? 'OPERATOR') as 'ADMIN' | 'OPERATOR';
        }
        return token;
      },
      // Mirror the role onto the session
      async session({ session, token }) {
        if (session.user) {
          (session.user as { id?: string }).id = token.id as string;
          (session.user as { role?: string }).role = token.role as string;
        }
        return session;
      },
    },
    events: {
      // Successful sign-in event — for the audit log.
      async signIn({ user }) {
        if (user?.email) {
          // The successful sign-in was already recorded inside `authorize`;
          // this adds a log line for the console/monitoring.
          console.log(`[auth] successful sign-in: ${user.email}`);
        }
      },
    },
  };
}

export const authOptions = getAuthOptions();
