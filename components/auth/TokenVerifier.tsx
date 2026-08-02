"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { verifyEmail } from "@/actions/auth";
import { ROUTES } from "@/constants/routes";
import { buttonVariants } from "@/components/ui/button.variants";

export function TokenVerifier({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function runVerification() {
      const result = await verifyEmail({ token });

      if (!active) return;

      if (result?.serverError) {
        setStatus("error");
        setErrorMessage(result.serverError.message);
        toast.error(result.serverError.message, { position: "top-center" });
        return;
      }

      toast.success("Email verified successfully!", {
        position: "top-center",
      });
      router.replace(ROUTES.DASHBOARD);
      router.refresh();
    }

    runVerification();

    return () => {
      active = false;
    };
  }, [token, router]);

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
