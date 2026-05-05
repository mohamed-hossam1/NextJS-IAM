"use client";

import { Suspense, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

type SuspenseOnSearchParamsProps = {
  children: ReactNode;
  fallback: ReactNode;
};

export function SuspenseOnSearchParams({
  children,
  fallback,
}: SuspenseOnSearchParamsProps) {
  const searchParams = useSearchParams();

  return (
    <Suspense key={searchParams.toString()} fallback={fallback}>
      {children}
    </Suspense>
  );
}
