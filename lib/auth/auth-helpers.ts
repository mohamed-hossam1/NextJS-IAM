import "server-only";
import { UnauthorizedError } from "@/lib/next-action-handler/error/errors";

export type AuthUser = {
  id: string;
  email: string;
};

export type PublicSession = {
  id: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthenticatedContext = {
  session: PublicSession;
  user: PublicUser;
};

export async function getSession(): Promise<AuthenticatedContext | null> {
  // Will be implemented in the NestJS API integration step
  return null;
}

export async function requireSession(): Promise<AuthenticatedContext> {
  const ctx = await getSession();
  if (!ctx) throw new UnauthorizedError();
  return ctx;
}

export async function requireUser(): Promise<AuthUser> {
  const ctx = await getSession();
  if (!ctx) throw new UnauthorizedError();
  return { id: ctx.user.id, email: ctx.user.email };
}
