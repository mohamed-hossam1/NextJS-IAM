"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useRef, type FormEvent } from "react";

import type {
  AdminUserSearchField,
  AdminUserSearchOperator,
  AdminUsersPageQuery,
} from "@/lib/zodSchema/admin-schema";
import { buildAdminUsersHref } from "@/lib/query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


function SearchFieldSelect({
  current,
  id,
}: {
  current: AdminUserSearchField;
  id: string;
}) {
  return (
    <select
      id={id}
      name="searchField"
      defaultValue={current}
      className="h-10 w-full border border-foreground bg-background px-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground outline-none transition-colors focus:border-accent"
      aria-label="Search field"
    >
      <option value="name">Name</option>
      <option value="email">Email</option>
    </select>
  );
}

function SearchOperatorSelect({
  current,
  id,
}: {
  current: AdminUserSearchOperator;
  id: string;
}) {
  return (
    <select
      id={id}
      name="searchOperator"
      defaultValue={current}
      className="h-10 w-full border border-foreground bg-background px-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground outline-none transition-colors focus:border-accent"
      aria-label="Search operator"
    >
      <option value="contains">Contains</option>
      <option value="starts_with">Starts with</option>
      <option value="ends_with">Ends with</option>
    </select>
  );
}

type SearchFormProps = {
  query: AdminUsersPageQuery;
};

export function SearchForm({ query }: SearchFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const data = new FormData(form);
    const searchValue = (data.get("searchValue") as string)?.trim() || undefined;
    const searchField = (data.get("searchField") as AdminUserSearchField) ?? query.searchField;
    const searchOperator = (data.get("searchOperator") as AdminUserSearchOperator) ?? query.searchOperator;

    const href = buildAdminUsersHref(query, {
      searchValue,
      searchField,
      searchOperator,
      page: 1,
    });

    router.push(href);
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid gap-3 border-b border-foreground pb-5 md:grid-cols-[minmax(220px,1fr)_150px_180px_auto_auto]"
    >
      <div>
        <label
          htmlFor="admin-users-search"
          className="mb-1 block font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
        >
          Search
        </label>
        <Input
          id="admin-users-search"
          name="searchValue"
          defaultValue={query.searchValue ?? ""}
          placeholder="Find a user"
          className="h-10 rounded-none border-foreground bg-background px-3 font-serif-body text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-accent focus-visible:ring-0"
        />
      </div>

      <div>
        <label
          htmlFor="admin-users-search-field"
          className="mb-1 block font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
        >
          Field
        </label>
        <SearchFieldSelect
          id="admin-users-search-field"
          current={query.searchField}
        />
      </div>

      <div>
        <label
          htmlFor="admin-users-search-operator"
          className="mb-1 block font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
        >
          Match
        </label>
        <SearchOperatorSelect
          id="admin-users-search-operator"
          current={query.searchOperator}
        />
      </div>

      <Button
        type="submit"
        variant="auth"
        size="auth-sm"
        className="mt-auto h-10 px-4"
      >
        <Search className="size-4" aria-hidden="true" />
        Search
      </Button>

      <Button
        asChild
        variant="auth-outline"
        size="auth-sm"
        className="mt-auto h-10 px-4"
      >
        <Link href="/admin">
          <X className="size-4" aria-hidden="true" />
          Clear
        </Link>
      </Button>
    </form>
  );
}
