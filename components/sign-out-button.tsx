'use client';

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { colors } from "@/config/colors";
import { Button } from "./ui/button";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Signed out successfully");
        router.replace("/admin");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <Button 
      variant={null}
      onClick={handleSignOut}
      className="transition-all hover:shadow-md text-white"
      style={{ backgroundColor: colors.primary[600] }}>
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  );
}
