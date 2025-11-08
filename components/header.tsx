import Link from "next/link";
import { Home } from "lucide-react";

import { ThemeToggleButton } from "./theme-toggle-button";

export function Header() {
  return (
    <div className="shadow-md border-b-2 bg-background border-border">
      <div className="mx-auto max-w-3xl px-4 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Home className="h-5 w-5" />
        </Link>
        <ThemeToggleButton />
      </div>
    </div>
  );
}
