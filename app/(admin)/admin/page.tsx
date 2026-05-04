import { Suspense } from "react";
import type { Metadata } from "next";

import { listUsers } from "@/actions/admin";

import SessionActions from "@/components/SessionActions";
import { SessionActionsSkeleton } from "@/components/skeletons/SessionActionsSkeleton";

import { ErrorBanner } from "@/components/users-admin/error-banner";
import { Pagination } from "@/components/users-admin/pagination";
import { SearchForm } from "@/components/users-admin/search-form";
import { UsersTable } from "@/components/users-admin/users-table";
import { parseAdminUsersQuery } from "@/lib/query";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type AdminUsersPageProps = {
  searchParams: SearchParams;
};

export const metadata: Metadata = {
  title: "Admin Users",
};

export default async function AdminPage({ searchParams }: AdminUsersPageProps) {
  const query = parseAdminUsersQuery(await searchParams);

  const result = await listUsers({
    searchValue: query.searchValue,
    searchField: query.searchField,
    searchOperator: query.searchOperator,
    limit: query.limit,
    offset: query.offset,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
  });

  const serverError = result?.serverError;
  const users = result?.data?.users ?? [];
  const total = result?.data?.total ?? 0;

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="flex items-center justify-between border-b border-foreground px-6 py-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          mocode · admin
        </p>
        <Suspense fallback={<SessionActionsSkeleton />}>
          <SessionActions />
        </Suspense>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif-display text-3xl italic leading-tight tracking-[-0.005em] text-title">
              Users
            </h1>
            <p className="mt-2 max-w-[70ch] font-serif-body text-sm italic text-subtitle">
              Review account access, verification, and lifecycle details.
            </p>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {total.toLocaleString()} records
          </p>
        </div>

        <SearchForm query={query} />

        {serverError ? (
          <ErrorBanner message={serverError.message} />
        ) : (
          <>
            <UsersTable users={users} query={query} />
            <Pagination query={query} total={total} userCount={users.length} />
          </>
        )}
      </main>
    </div>
  );
}
