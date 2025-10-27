import Link from "next/link";

import { AdminLoginForm } from "@/components/admin-login-form";
import { Toaster } from "@/components/ui/sonner";

export default function AdminSignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Toaster />
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Restaurant Admin
          </h1>
          <p className="text-sm text-gray-600">
            Sign in to manage your restaurants.
          </p>
        </div>
        <AdminLoginForm />
        <p className="mt-6 text-center text-sm text-gray-600">
          Need an account?{" "}
          <Link href="/admin/signup" className="font-medium text-green-600">
            Create one
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
