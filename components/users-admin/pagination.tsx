import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { buildAdminUsersHref } from "../../lib/query";
import { AdminUsersPageQuery } from "@/lib/zodSchema/admin-schema";

type PaginationProps = {
  query: AdminUsersPageQuery;
  total: number;
  userCount: number;
};

export function Pagination({ query, total, userCount }: PaginationProps) {
  const firstUserNumber = total === 0 ? 0 : query.offset + 1;
  const lastUserNumber = Math.min(query.offset + userCount, total);
  const hasPreviousPage = query.page > 1;
  const hasNextPage = query.offset + query.limit < total;

  return (
    <nav
      className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Users pagination"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Showing {firstUserNumber.toLocaleString()}-
        {lastUserNumber.toLocaleString()} of {total.toLocaleString()}
      </p>

      <div className="flex items-center gap-2">
        {hasPreviousPage ? (
          <Button
            asChild
            variant="auth-outline"
            size="auth-sm"
            className="h-9 px-3"
          >
            <Link
              href={buildAdminUsersHref(query, {
                page: query.page - 1,
              })}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Previous
            </Link>
          </Button>
        ) : (
          <Button
            type="button"
            variant="auth-outline"
            size="auth-sm"
            className="h-9 px-3"
            disabled
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Previous
          </Button>
        )}

        {hasNextPage ? (
          <Button
            asChild
            variant="auth-outline"
            size="auth-sm"
            className="h-9 px-3"
          >
            <Link
              href={buildAdminUsersHref(query, {
                page: query.page + 1,
              })}
            >
              Next
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button
            type="button"
            variant="auth-outline"
            size="auth-sm"
            className="h-9 px-3"
            disabled
          >
            Next
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </nav>
  );
}
