import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/infra/db/prisma';
import { encryptTmdbToken } from '@/infra/tmdb/tokenVault';

export const hasGoogle = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
export const hasGuestLogin = process.env.GUEST_LOGIN_ENABLED === 'true';
// Shared demo/guest account — provisioned by seed + demo reset on the demo DB.
export const guestEmail = process.env.DEMO_USER_EMAIL ?? 'demo@chronicle.local';

/** Server-side token used ONLY to provision the shared demo/guest account. */
const demoToken = (): string | null =>
  process.env.DEMO_TMDB_TOKEN ?? process.env.TMDB_ACCESS_TOKEN ?? null;

export type AuthProviderId = 'google' | 'credentials' | 'guest';

export const availableProviders: { id: AuthProviderId; name: string }[] = [
  ...(hasGoogle ? [{ id: 'google' as const, name: 'Google' }] : []),
  { id: 'credentials' as const, name: 'Email' },
  ...(hasGuestLogin ? [{ id: 'guest' as const, name: 'Guest' }] : []),
];

const MIN_PASSWORD_LENGTH = 8;

export const isValidPassword = (value: unknown): value is string =>
  typeof value === 'string' && value.length >= MIN_PASSWORD_LENGTH;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    ...(hasGoogle ? [Google] : []),
    // Public demo entry: anyone can sign in as the shared guest account.
    // No password — it only ever resolves to the single guest user.
    ...(hasGuestLogin
      ? [
          Credentials({
            id: 'guest',
            name: 'Guest',
            credentials: {},
            authorize: async () => {
              try {
                const token = demoToken();
                let user = await prisma.user.findUnique({ where: { email: guestEmail } });
                if (!user) {
                  try {
                    user = await prisma.user.create({
                      data: { email: guestEmail, name: 'Guest' },
                    });
                  } catch {
                    // Concurrent first sign-ins: someone else created it.
                    user = await prisma.user.findUnique({ where: { email: guestEmail } });
                  }
                }
                if (!user) return null;
                // Provision the shared demo token once (no live check here —
                // validation happens at seed time to spare the shared quota).
                if (!user.tmdbTokenCiphertext && token) {
                  try {
                    const { iv, ciphertext } = encryptTmdbToken(token);
                    user = await prisma.user.update({
                      where: { id: user.id },
                      data: {
                        tmdbTokenIv: iv,
                        tmdbTokenCiphertext: ciphertext,
                        tmdbTokenUpdatedAt: new Date(),
                      },
                    });
                  } catch (error) {
                    console.error('[auth][guest] token provisioning failed:', error);
                  }
                }
                return { id: user.id, email: user.email, name: user.name };
              } catch (error) {
                console.error('[auth][guest] authorize failed:', error);
                return null;
              }
            },
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          const email =
            typeof credentials?.email === 'string' ? credentials.email.trim().toLowerCase() : '';
          const password = typeof credentials?.password === 'string' ? credentials.password : '';
          if (!email.includes('@') || !isValidPassword(password)) return null;

          const user = await prisma.user.findUnique({ where: { email } });
          if (!user?.passwordHash) return null;

          const matches = await compare(password, user.passwordHash);
          if (!matches) return null;

          return { id: user.id, email: user.email, name: user.name };
        } catch (error) {
          console.error('[auth][credentials] authorize failed:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session: ({ session, token }) => {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
