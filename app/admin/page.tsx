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
import { colors } from "@/config/colors";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token");

  if (token) {
    redirect("/admin/dashboard");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: colors.background.secondary }}
    >
      <div className="w-full max-w-md">
        <Card
          className="border-2 shadow-2xl"
          style={{
            backgroundColor: colors.background.primary,
            borderColor: colors.border.light,
          }}
        >
          <CardHeader className="text-center space-y-4">
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full shadow-lg"
              style={{ backgroundColor: colors.primary[600] }}
            >
              <Shield className="h-10 w-10 text-white" />
            </div>
            <div>
              <CardTitle
                className="text-3xl font-bold"
                style={{ color: colors.text.primary }}
              >
                Admin Portal
              </CardTitle>
              <CardDescription
                className="text-base mt-2"
                style={{ color: colors.text.secondary }}
              >
                Sign in to manage your restaurant
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <AdminLoginForm />
            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Don&apos;t have an account?{" "}
                <Link
                  href="/admin/signup"
                  className="font-semibold inline-flex items-center gap-1 hover:underline transition-all"
                  style={{ color: colors.primary[600] }}
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
