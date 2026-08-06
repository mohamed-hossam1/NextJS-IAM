export type BanRecord = {
  id: string;
  bannedAt: string;
  unbannedAt: string | null;
  banReason: string;
};

export type AdminPublicUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: "user" | "admin";
  isVerified: boolean;
  isBanned: boolean;
  hasPassword: boolean;
  createdAt: string;
  ban: BanRecord | null;
  banHistory?: BanRecord[];
};

export type AdminSession = {
  sessionId: string;
  userAgent: string | null;
  ipAddress: string | null;
  status: "active" | "revoked" | "expired";
  createdAt: string;
  lastUsedAt: string;
  revokedAt: string | null;
  expiresAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type ListUsersResponse = {
  users: AdminPublicUser[];
  pagination: PaginationMeta;
};

export type ListUserSessionsResponse = {
  sessions: AdminSession[];
  pagination: PaginationMeta;
};
