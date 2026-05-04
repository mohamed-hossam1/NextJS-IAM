import type {
  AdminListedUser,
  AdminUsersPageQuery,
} from "@/lib/zodSchema/admin-schema";
import { getInitials } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatAdminDate } from "../../lib/query";
import { SortHeader } from "./sort-header";
import { StatusBadge } from "./status-badge";

function EmptyRow() {
  return (
    <TableRow>
      <TableCell colSpan={6} className="h-32 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          No users found
        </p>
        <p className="mt-1 font-serif-body text-sm italic text-subtitle">
          Adjust the search and try again.
        </p>
      </TableCell>
    </TableRow>
  );
}

function UserRow({ user }: { user: AdminListedUser }) {
  return (
    <TableRow className="border-border">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center border border-foreground bg-background font-mono text-[11px] uppercase tracking-[0.06em]">
            {getInitials(user)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-serif-display text-[20px] leading-tight text-foreground">
              {user.name}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              {user.id}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <span className="font-serif-body text-sm text-foreground">
          {user.email}
        </span>
      </TableCell>

      <TableCell>
        <StatusBadge variant="muted">{user.role ?? "user"}</StatusBadge>
      </TableCell>

      <TableCell>
        <div className="flex flex-wrap gap-1.5">
          {user.banned ? (
            <StatusBadge variant="bad">Banned</StatusBadge>
          ) : user.emailVerified ? (
            <StatusBadge variant="good">Verified</StatusBadge>
          ) : (
            <StatusBadge variant="muted">Unverified</StatusBadge>
          )}
        </div>
      </TableCell>

      <TableCell className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {formatAdminDate(user.createdAt)}
      </TableCell>

      <TableCell className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {formatAdminDate(user.updatedAt)}
      </TableCell>
    </TableRow>
  );
}

type UsersTableProps = {
  users: AdminListedUser[];
  query: AdminUsersPageQuery;
};

export function UsersTable({ users, query }: UsersTableProps) {
  return (
    <div className="border border-foreground bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-foreground hover:bg-transparent">
            <TableHead className="min-w-[240px]">
              <SortHeader field="name" label="User" query={query} />
            </TableHead>
            <TableHead className="min-w-[260px]">
              <SortHeader field="email" label="Email" query={query} />
            </TableHead>
            <TableHead>
              <SortHeader field="role" label="Role" query={query} />
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <SortHeader field="createdAt" label="Created" query={query} />
            </TableHead>
            <TableHead>
              <SortHeader field="updatedAt" label="Updated" query={query} />
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 ? (
            <EmptyRow />
          ) : (
            users.map((user) => <UserRow key={user.id} user={user} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}
