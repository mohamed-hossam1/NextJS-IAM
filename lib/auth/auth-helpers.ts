import "server-only";
import { headers } from "next/headers";
import { auth, ROLE } from "@/lib/auth/auth";
import { UnauthorizedError } from "@/lib/next-action-handler/error/errors";

export type AuthUser = {
  id: string;
  email: string;
};

// ─────────────────────────────────────────────────────────────
// Public-facing types (safe to import in client components)
// ─────────────────────────────────────────────────────────────

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
  role: string | null;
};

export type AuthenticatedContext = {
  session: PublicSession;
  user: PublicUser;
};

// ─────────────────────────────────────────────────────────────
// Internal raw type — defined once
// ─────────────────────────────────────────────────────────────

type RawSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

// ─────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────

export function toPublicSession(s: RawSession["session"]): PublicSession {
  return {
    id: s.id,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    expiresAt: s.expiresAt.toISOString(),
    ipAddress: s.ipAddress ?? null,
    userAgent: s.userAgent ?? null,
  };
}

function toPublicUser(u: RawSession["user"]): PublicUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    emailVerified: u.emailVerified,
    image: u.image ?? null,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    role: u.role ?? null,
  };
}

// ─────────────────────────────────────────────────────────────
// Core fetch — single call to the auth API
// ─────────────────────────────────────────────────────────────

async function getRawSession(): Promise<RawSession | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.session || !session.user) return null;
  return session;
}

// ─────────────────────────────────────────────────────────────
// Public API — for server components & actions
// ─────────────────────────────────────────────────────────────

export async function getSession(): Promise<AuthenticatedContext | null> {
  const raw = await getRawSession();
  if (!raw) return null;
  return {
    session: toPublicSession(raw.session),
    user: toPublicUser(raw.user),
  };
}

export async function requireSession(): Promise<AuthenticatedContext> {
  const ctx = await getSession();
  if (!ctx) throw new UnauthorizedError();
  return ctx;
}


const UNAUTHORIZED_MESSAGE = "You are not authorized to access this page";

export async function requireUser(): Promise<AuthUser> {
  const raw = await getRawSession();
  if (!raw) throw new UnauthorizedError(UNAUTHORIZED_MESSAGE);
  return { id: raw.user.id, email: raw.user.email };
}

export async function requireAdmin(): Promise<AuthUser> {
  const raw = await getRawSession();
  if (!raw) throw new UnauthorizedError(UNAUTHORIZED_MESSAGE);
  if (raw.user.role !== ROLE.ADMIN) throw new UnauthorizedError(UNAUTHORIZED_MESSAGE);
  return { id: raw.user.id, email: raw.user.email };
}


export async function requireAdminSession(): Promise<AuthenticatedContext> {
  const ctx = await getSession();
  if (!ctx) throw new UnauthorizedError(UNAUTHORIZED_MESSAGE);
  if (ctx.user.role !== ROLE.ADMIN) throw new UnauthorizedError(UNAUTHORIZED_MESSAGE);
  return ctx;
}