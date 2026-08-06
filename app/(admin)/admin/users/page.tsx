import { UsersTable } from "@/components/admin/UsersTable";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif-display italic text-2xl">Users</h1>
      <UsersTable />
    </div>
  );
}
