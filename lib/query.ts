import {
  ADMIN_LIST_USERS_DEFAULTS,
  ADMIN_USER_SEARCH_FIELDS,
  ADMIN_USER_SEARCH_OPERATORS,
  ADMIN_USER_SORT_DIRECTIONS,
  ADMIN_USER_SORT_FIELDS,
  AdminUsersPageQuery,
  type AdminUserSortDirection,
  type AdminUserSortField,
} from "@/lib/zodSchema/admin-schema";


type SearchParams = Record<string, string | string[] | undefined>;


function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeInteger(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function normalizeChoice<T extends readonly string[]>(
  value: string | undefined,
  choices: T,
  fallback: T[number],
): T[number] {
  return choices.includes(value ?? "")
    ? (value as T[number])
    : fallback;
}


export function parseAdminUsersQuery(params: SearchParams): AdminUsersPageQuery {
  const page = normalizeInteger(firstParam(params.page), 1, 1, 10_000);
  const limit = normalizeInteger(
    firstParam(params.limit),
    ADMIN_LIST_USERS_DEFAULTS.limit,
    1,
    100,
  );
  const searchValue = firstParam(params.searchValue)?.trim() || undefined;

  return {
    searchValue,
    searchField: normalizeChoice(
      firstParam(params.searchField),
      ADMIN_USER_SEARCH_FIELDS,
      ADMIN_LIST_USERS_DEFAULTS.searchField,
    ),
    searchOperator: normalizeChoice(
      firstParam(params.searchOperator),
      ADMIN_USER_SEARCH_OPERATORS,
      ADMIN_LIST_USERS_DEFAULTS.searchOperator,
    ),
    limit,
    offset: (page - 1) * limit,
    sortBy: normalizeChoice(
      firstParam(params.sortBy),
      ADMIN_USER_SORT_FIELDS,
      ADMIN_LIST_USERS_DEFAULTS.sortBy,
    ),
    sortDirection: normalizeChoice(
      firstParam(params.sortDirection),
      ADMIN_USER_SORT_DIRECTIONS,
      ADMIN_LIST_USERS_DEFAULTS.sortDirection,
    ),
    page,
  };
}


export function buildAdminUsersHref(
  currentQuery: AdminUsersPageQuery,
  overrides: Partial<AdminUsersPageQuery>,
): string {
  const query = { ...currentQuery, ...overrides };
  const params = new URLSearchParams();

  if (query.searchValue) params.set("searchValue", query.searchValue);
  if (query.searchField !== ADMIN_LIST_USERS_DEFAULTS.searchField)
    params.set("searchField", query.searchField);
  if (query.searchOperator !== ADMIN_LIST_USERS_DEFAULTS.searchOperator)
    params.set("searchOperator", query.searchOperator);
  if (query.limit !== ADMIN_LIST_USERS_DEFAULTS.limit)
    params.set("limit", String(query.limit));
  if (query.page !== 1) params.set("page", String(query.page));
  if (query.sortBy !== ADMIN_LIST_USERS_DEFAULTS.sortBy)
    params.set("sortBy", query.sortBy);
  if (query.sortDirection !== ADMIN_LIST_USERS_DEFAULTS.sortDirection)
    params.set("sortDirection", query.sortDirection);

  const qs = params.toString();
  return qs ? `/admin?${qs}` : "/admin";
}


export function getSortDirection(
  currentQuery: AdminUsersPageQuery,
  field: AdminUserSortField,
): AdminUserSortDirection {
  if (currentQuery.sortBy !== field) return "asc";
  return currentQuery.sortDirection === "asc" ? "desc" : "asc";
}


export function formatAdminDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
    .format(new Date(value))
    .toUpperCase();
}
