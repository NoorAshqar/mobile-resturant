import Link from "next/link";

import { AdminSignupForm } from "@/components/admin-signup-form";
import { Toaster } from "@/components/ui/sonner";

export default function AdminSignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Toaster />
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Admin Account
          </h1>
          <p className="text-sm text-gray-600">
            Set up your admin credentials to manage restaurants.
          </p>
        </div>
        <AdminSignupForm />
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/admin" className="font-medium text-green-600">
            Sign in
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
