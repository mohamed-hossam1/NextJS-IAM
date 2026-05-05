import { Suspense } from "react";
import type { Metadata } from "next";

import { listUsers } from "@/actions/admin";
import { parseAdminUsersQuery } from "@/lib/query";

import SessionActions from "@/components/SessionActions";
import { SuspenseOnSearchParams } from "@/components/SuspenseOnSearchParams";
import { AdminUsersTableSkeleton } from "@/components/skeletons/AdminUsersTableSkeleton";
import { SessionActionsSkeleton } from "@/components/skeletons/SessionActionsSkeleton";

import { ErrorBanner } from "@/components/users-admin/error-banner";
import { Pagination } from "@/components/users-admin/pagination";
import { SearchForm } from "@/components/users-admin/search-form";
import { UsersTable } from "@/components/users-admin/users-table";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type AdminUsersPageProps = {
  searchParams: SearchParams;
};

export const metadata: Metadata = {
  title: "Admin Users",
};

async function RecordsCount({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
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
  const total = result?.data?.total ?? 0;

  if (serverError) return null;

  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
      {total.toLocaleString()} records
    </p>
  );
}

async function AdminUsersList({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
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

  if (serverError) {
    return <ErrorBanner message={serverError.message} />;
  }

  return (
    <>
      <UsersTable users={users} query={query} />
      <Pagination
        query={query}
        total={total}
        userCount={users.length}
      />
    </>
  );
}

export default async function AdminPage({ searchParams }: AdminUsersPageProps) {
  const query = parseAdminUsersQuery(await searchParams);

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
          <Suspense fallback={<div className="h-4 w-20 animate-pulse bg-muted/60" />}>
            <RecordsCount searchParams={searchParams} />
          </Suspense>
        </div>

        <SearchForm query={query} />

        <SuspenseOnSearchParams fallback={<AdminUsersTableSkeleton />}>
          <AdminUsersList searchParams={searchParams} />
        </SuspenseOnSearchParams>
      </main>
    </div>
  );
}
