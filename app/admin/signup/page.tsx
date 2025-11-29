import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";

import { AdminSignupForm } from "@/components/admin-signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminSignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full shadow-lg">
              <UserPlus className="h-10 w-10 text-black dark:text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold">
                Create Admin Account
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Get started by creating your admin account
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <AdminSignupForm />
            <div className="mt-6 text-center">
              <p className="text-sm">
                Already have an account?
                <Link
                  href="/admin"
                  className="font-semibold inline-flex items-center gap-1 hover:underline transition-all align-middle ml-2 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 align-middle" />
                  Sign in instead
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
