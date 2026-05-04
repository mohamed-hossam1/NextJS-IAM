import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorBannerProps = {
  message: string;
};

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="flex flex-col gap-3 border border-destructive bg-destructive/5 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertCircle
          className="mt-0.5 size-5 shrink-0 text-destructive"
          aria-hidden="true"
        />
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
            Failed to load users
          </p>
          <p className="mt-1 font-serif-body text-sm italic text-subtitle">
            {message}
          </p>
        </div>
      </div>
      <Button asChild variant="auth-outline" size="auth-sm">
        <Link href="/admin">Retry</Link>
      </Button>
    </div>
  );
}
