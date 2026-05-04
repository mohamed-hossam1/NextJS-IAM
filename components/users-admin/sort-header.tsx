import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import type {
  AdminUserSortField,
  AdminUsersPageQuery,
} from "@/lib/zodSchema/admin-schema";
import { cn } from "@/lib/utils";

import { buildAdminUsersHref, getSortDirection } from "../../lib/query";

type SortHeaderProps = {
  field: AdminUserSortField;
  label: string;
  query: AdminUsersPageQuery;
};

export function SortHeader({ field, label, query }: SortHeaderProps) {
  const isActive = query.sortBy === field;
  const nextDirection = getSortDirection(query, field);
  const Icon = !isActive
    ? ArrowUpDown
    : query.sortDirection === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <Link
      href={buildAdminUsersHref(query, {
        page: 1,
        sortBy: field,
        sortDirection: nextDirection,
      })}
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:text-accent",
        isActive ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {label}
      <Icon className="size-3.5" aria-hidden="true" />
    </Link>
  );
}
