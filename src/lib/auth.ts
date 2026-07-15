import bcrypt from 'bcryptjs';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import { SystemRole } from '@prisma/client';
import { prisma } from './db';
import { recordAudit } from './audit';
import type { AuthorizedUser } from './rbac/authorize';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role: SystemRole;
      isActive: boolean;
      mfaEnabled: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    role: SystemRole;
    isActive: boolean;
    mfaEnabled: boolean;
    firstName?: string;
    lastName?: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 30 },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: { role: true },
        });
        if (!user || !user.isActive) return null;

        const passwordOk = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!passwordOk) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
        await recordAudit({
          userId: user.id,
          action: 'user_signed_in',
          resource: 'user',
          resourceId: user.id,
        });

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.name,
          isActive: user.isActive,
          mfaEnabled: user.mfaEnabled,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).id;
        token.role = (user as any).role;
        token.isActive = (user as any).isActive;
        token.mfaEnabled = (user as any).mfaEnabled;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.userId,
        email: session.user?.email ?? '',
        firstName: token.firstName,
        lastName: token.lastName,
        role: token.role,
        isActive: token.isActive,
        mfaEnabled: token.mfaEnabled,
      };
      return session;
    },
  },
};

export async function getCurrentUser(): Promise<AuthorizedUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    isActive: session.user.isActive,
    mfaEnabled: session.user.mfaEnabled,
  };
}
