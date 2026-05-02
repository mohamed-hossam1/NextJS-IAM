import type { Metadata } from "next";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { requireAdmin } from "@/lib/auth/auth-helpers";

export const metadata: Metadata = {
  title: "mocode",
  description: "A modern web application built with Next.js",
};

export default async function Home() {
  const isAdmin = await requireAdmin();
  console.log(isAdmin.user.role);
  return (
    <div>
      <ModeToggle />
    </div>
  );
}
