'use client';

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "./ui/button";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok && response.status !== 401) {
          toast.error("Failed to sign out.");
          return;
        }

        toast.success("Signed out.");
        window.location.href = "/admin";
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong.");
      }
    });
  };

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={handleSignOut}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing out…
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4" />
          Sign out
        </>
      )}
    </Button>
  );
}
