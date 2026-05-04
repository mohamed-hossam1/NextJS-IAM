"use server";

import { asc, count, desc, ilike, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth-schema";
import { adminActionClient } from "@/lib/next-action-handler/safe-action";
import { DatabaseError } from "@/lib/next-action-handler/error/errors";
import {
  AdminListUsersInputSchema,
  type AdminListedUser,
  type AdminListUsersQuery,
  type AdminUserSearchField,
  type AdminUserSearchOperator,
  type AdminUserSortField,
} from "@/lib/zodSchema/admin-schema";

type RawListedUser = typeof userTable.$inferSelect;

function toIsoString(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function toNullableIsoString(
  value: Date | string | null | undefined,
): string | null {
  if (!value) return null;
  return toIsoString(value);
}

function toAdminListedUser(user: RawListedUser): AdminListedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image ?? null,
    createdAt: toIsoString(user.createdAt),
    updatedAt: toIsoString(user.updatedAt),
    role: user.role ?? null,
    banned: Boolean(user.banned),
    banReason: user.banReason ?? null,
    banExpires: toNullableIsoString(user.banExpires),
  };
}

function getSearchColumn(field: AdminUserSearchField) {
  if (field === "email") return userTable.email;
  return userTable.name;
}

function getSearchPattern(
  value: string,
  operator: AdminUserSearchOperator,
): string {
  if (operator === "starts_with") return `${value}%`;
  if (operator === "ends_with") return `%${value}`;
  return `%${value}%`;
}

function getSortColumn(field: AdminUserSortField) {
  if (field === "name") return userTable.name;
  if (field === "email") return userTable.email;
  if (field === "role") return userTable.role;
  if (field === "updatedAt") return userTable.updatedAt;
  return userTable.createdAt;
}

function getSearchWhere(query: AdminListUsersQuery): SQL | undefined {
  if (!query.searchValue) return undefined;

  return ilike(
    getSearchColumn(query.searchField),
    getSearchPattern(query.searchValue, query.searchOperator),
  );
}

export type {
  AdminListedUser,
  AdminListUsersInput,
  AdminListUsersQuery,
  AdminUserSearchField,
  AdminUserSearchOperator,
  AdminUserSortDirection,
  AdminUserSortField,
} from "@/lib/zodSchema/admin-schema";

export const listUsers = adminActionClient
  .metadata({ actionName: "admin.listUsers" })
  .inputSchema(AdminListUsersInputSchema)
  .action(async ({ parsedInput }) => {
    try {
      const where = getSearchWhere(parsedInput);
      const sortColumn = getSortColumn(parsedInput.sortBy);
      const sort = parsedInput.sortDirection === "desc" ? desc : asc;

      const [users, totalResult] = await Promise.all([
        db
          .select()
          .from(userTable)
          .where(where)
          .orderBy(sort(sortColumn))
          .limit(parsedInput.limit)
          .offset(parsedInput.offset),
        db.select({ total: count() }).from(userTable).where(where),
      ]);

      return {
        users: users.map(toAdminListedUser),
        total: totalResult[0]?.total ?? 0,
        limit: parsedInput.limit,
        offset: parsedInput.offset,
      };
    } catch (error) {
      throw new DatabaseError("Failed to load users.", error);
    }
  });
