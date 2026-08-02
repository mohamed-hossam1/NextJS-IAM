"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { verifyEmail } from "@/actions/auth";
import { ROUTES } from "@/constants/routes";
import { buttonVariants } from "@/components/ui/button.variants";

export function TokenVerifier({ token }: { token: string }) {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    async function runVerification() {
      const result = await verifyEmail({ token });

      if (result?.serverError) {
        setStatus("error");
        setErrorMessage(result.serverError.message);
        toast.error(result.serverError.message, { position: "top-center" });
        return;
      }

      setStatus("success");
      toast.success("Email verified successfully!", {
        position: "top-center",
      });

      setTimeout(() => {
        window.location.replace(ROUTES.DASHBOARD);
      }, 500);
    }

    runVerification();
  }, [token]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-4">
        <Loader2 className="animate-spin size-6 text-accent" />
        <p className="font-serif-body italic text-sm text-subtitle">
          Verifying your email token...
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
        <CheckCircle2 className="size-8 text-accent animate-pulse" />
        <p className="font-serif-body italic text-sm text-title font-bold">
          Email verified successfully!
        </p>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="size-5" />
        <p className="font-serif-body italic text-sm">{errorMessage}</p>
      </div>
      <Link
        href={ROUTES.LOGIN}
        className={buttonVariants({ variant: "auth", size: "auth-lg" })}
      >
        Back to sign in
      </Link>
    </div>
  );
}
