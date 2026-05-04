import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  variant: "good" | "muted" | "bad";
  children: React.ReactNode;
};

export function StatusBadge({ variant, children }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-1.5 py-[3px] font-mono text-[10px] uppercase tracking-[0.06em]",
        variant === "good" && "border-good bg-good/10 text-good",
        variant === "muted" &&
          "border-border bg-background text-muted-foreground",
        variant === "bad" &&
          "border-destructive bg-destructive/10 text-destructive",
      )}
    >
      {children}
    </span>
  );
}
