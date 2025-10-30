
'use client';

import Link from "next/link";
import { Home } from "lucide-react";
import { colors } from "@/config/colors";

export function Header() {
  return (
    <div
      className="shadow-md border-b-2"
      style={{
        backgroundColor: colors.background.primary,
        borderColor: colors.border.light
      }}
    >
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Link href="/" className="flex items-center gap-2">
          <Home className="h-5 w-5" style={{ color: colors.primary[600] }} />
        </Link>
      </div>
    </div>
  );
}
