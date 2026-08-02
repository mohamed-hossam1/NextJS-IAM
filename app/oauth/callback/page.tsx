"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.DASHBOARD);
  }, [router]);

  return null;
}
