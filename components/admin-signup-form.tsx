"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
}

export function AdminSignupForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.email || !formState.password) {
      toast.error("Email and password are required.");
      return;
    }

    if (formState.password !== formState.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formState.email,
          password: formState.password,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        const message = error?.message ?? "Unable to create admin account.";
        toast.error(message);
        return;
      }

      toast.success("Admin account created. Please sign in.");
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formState.email}
            onChange={handleChange}
            disabled={isSubmitting}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a secure password"
            value={formState.password}
            onChange={handleChange}
            disabled={isSubmitting}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-semibold"
        >
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter password"
            value={formState.confirmPassword}
            onChange={handleChange}
            disabled={isSubmitting}
            className="pl-10"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full text-white transition-all hover:shadow-lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account…
          </>
        ) : (
          "Create admin account"
        )}
      </Button>
    </form>
  );
}
