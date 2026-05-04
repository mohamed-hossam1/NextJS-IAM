import { z } from "zod";

export const ADMIN_USER_SEARCH_FIELDS = ["name", "email"] as const;
export const ADMIN_USER_SEARCH_OPERATORS = [
  "contains",
  "starts_with",
  "ends_with",
] as const;
export const ADMIN_USER_SORT_FIELDS = [
  "name",
  "email",
  "role",
  "createdAt",
  "updatedAt",
] as const;
export const ADMIN_USER_SORT_DIRECTIONS = ["asc", "desc"] as const;

export const ADMIN_LIST_USERS_DEFAULTS = {
  searchField: "name",
  searchOperator: "contains",
  limit: 20,
  offset: 0,
  sortBy: "createdAt",
  sortDirection: "desc",
} as const;

const OptionalSearchValueSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().max(100).optional());

export const AdminListUsersInputSchema = z.object({
  searchValue: OptionalSearchValueSchema,
  searchField: z
    .enum(ADMIN_USER_SEARCH_FIELDS)
    .default(ADMIN_LIST_USERS_DEFAULTS.searchField),
  searchOperator: z
    .enum(ADMIN_USER_SEARCH_OPERATORS)
    .default(ADMIN_LIST_USERS_DEFAULTS.searchOperator),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(ADMIN_LIST_USERS_DEFAULTS.limit),
  offset: z.coerce
    .number()
    .int()
    .min(0)
    .default(ADMIN_LIST_USERS_DEFAULTS.offset),
  sortBy: z
    .enum(ADMIN_USER_SORT_FIELDS)
    .default(ADMIN_LIST_USERS_DEFAULTS.sortBy),
  sortDirection: z
    .enum(ADMIN_USER_SORT_DIRECTIONS)
    .default(ADMIN_LIST_USERS_DEFAULTS.sortDirection),
});

export type AdminListedUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  role: string | null;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
};

export type AdminUserSearchField = (typeof ADMIN_USER_SEARCH_FIELDS)[number];
export type AdminUserSearchOperator =
  (typeof ADMIN_USER_SEARCH_OPERATORS)[number];
export type AdminUserSortField = (typeof ADMIN_USER_SORT_FIELDS)[number];
export type AdminUserSortDirection =
  (typeof ADMIN_USER_SORT_DIRECTIONS)[number];
export type AdminListUsersInput = z.input<typeof AdminListUsersInputSchema>;
export type AdminListUsersQuery = z.output<typeof AdminListUsersInputSchema>;
export type AdminUsersPageQuery = AdminListUsersQuery & {
  page: number;
};
