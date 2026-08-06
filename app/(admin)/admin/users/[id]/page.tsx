"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/actions/admin";
import { adminUserDetailQueryKey } from "@/lib/reactQuery/query-keys";
import { UserDetailsCard } from "@/components/admin/UserDetailsCard";
import { UserSessionsTable } from "@/components/admin/UserSessionsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: adminUserDetailQueryKey(userId),
    queryFn: async () => {
      const result = await getUserById({ id: userId });
      if (result?.serverError) throw new Error(result.serverError.message);
      return result?.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.ADMIN_USERS}>
          <Button variant="auth-outline" size="auth-sm">
            <ArrowLeft className="size-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="font-serif-display italic text-2xl">User Details</h1>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-none bg-foreground/10" />
        </div>
      )}

      {error && (
        <div className="border border-destructive bg-destructive/5 rounded-none p-6">
          <p className="font-serif-body italic text-destructive text-sm">
            {error instanceof Error ? error.message : "Failed to load user"}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 font-mono text-[11px] uppercase tracking-widest text-accent underline"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && data?.user && (
        <>
          <UserDetailsCard user={data.user} />
          <UserSessionsTable userId={userId} />
        </>
      )}
    </div>
  );
}
