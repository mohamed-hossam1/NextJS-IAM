export function AdminUsersTableSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="border border-foreground bg-card">
        <div className="flex flex-col">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 animate-pulse bg-muted/60" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-4 w-36 animate-pulse bg-muted/60" />
                  <div className="h-3 w-24 animate-pulse bg-muted/60" />
                </div>
              </div>
              <div className="ml-auto h-4 w-48 animate-pulse bg-muted/60" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="h-8 w-64 animate-pulse bg-muted/60" />
      </div>
    </div>
  );
}
