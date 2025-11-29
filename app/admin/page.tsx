import { ArrowRight, Shield } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin-login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token");

  if (token) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full shadow-lg">
              <Shield className="h-10 w-10 text-black dark:text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold">Admin Portal</CardTitle>
              <CardDescription className="text-base mt-2">
                Sign in to manage your restaurant
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <AdminLoginForm />
            <div className="mt-6 text-center">
              <p className="text-sm">
                Don&apos;t have an account?
                <Link
                  href="/admin/signup"
                  className="font-semibold inline-flex items-center gap-1 hover:underline transition-all ml-2 cursor-pointer"
                >
                  Create one now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
