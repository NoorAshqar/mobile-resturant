"use client";

import Link from "next/link";
import {
  Shield,
  Store,
  Table as TableIcon,
  ShoppingCart,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Toaster } from "./ui/sonner";

export function HomePage() {
  return (
    <div className="min-h-screen">
      <Toaster />

      {/* Header */}
      <header className="border-b-2 sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl">
              <Store className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">Restaurant Manager</h1>
          </div>
          <Link href="/admin">
            <Button variant="outline" className="border-2 font-semibold">
              <Shield className="mr-2 h-4 w-4" />
              Admin Portal
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Manage Your Restaurant
            <br />
            <span>The Easy Way</span>
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Complete restaurant management system for digital menus, table
            orders, and seamless customer experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin/signup">
              <Button className="text-white font-semibold shadow-lg px-8 py-6 text-lg">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                variant="outline"
                className="font-semibold border-2 px-8 py-6 text-lg"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Everything You Need
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1: Sign Up Restaurant */}
          <Card className="p-8 border-2 transition-all hover:shadow-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl mb-6">
              <Store className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-bold mb-3">Sign Up Your Restaurant</h4>
            <p className="text-base mb-4">
              Create your restaurant profile, manage your menu items, and set up
              your business in minutes.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4" />
                Easy setup process
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4" />
                Customize your menu
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4" />
                Manage restaurant details
              </li>
            </ul>
          </Card>

          {/* Feature 2: Tables */}
          <Card className="p-8 border-2 transition-all hover:shadow-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl mb-6">
              <TableIcon className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-bold mb-3">Manage Tables</h4>
            <p className="text-base mb-4">
              Set up tables with unique QR codes. Customers can scan and order
              directly from their table.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4" />
                Table management system
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4" />
                Real-time order tracking
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4" />
                Digital menus per table
              </li>
            </ul>
          </Card>

          {/* Feature 3: Pay or Order */}
          <Card className="p-8 border-2 transition-all hover:shadow-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl mb-6">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-bold mb-3">Pay or Order</h4>
            <p className="text-base mb-4">
              Customers can browse menus, place orders, and view their bill.
              Seamless ordering experience.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4" />
                Easy ordering system
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4" />
                Live bill tracking
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4" />
                Simple payment process
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">
          How It Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-4">
              <span className="text-2xl font-bold">1</span>
            </div>
            <h4 className="text-lg font-bold mb-2">Sign Up</h4>
            <p className="text-sm">
              Create your restaurant account and complete your profile
            </p>
          </div>
          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-4">
              <span className="text-2xl font-bold">2</span>
            </div>
            <h4 className="text-lg font-bold mb-2">Set Up Tables</h4>
            <p className="text-sm">
              Add your tables and generate unique links for each table
            </p>
          </div>
          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-4">
              <span className="text-2xl font-bold">3</span>
            </div>
            <h4 className="text-lg font-bold mb-2">Manage Menu</h4>
            <p className="text-sm">
              Add menu items, categories, and prices to your digital menu
            </p>
          </div>
          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-4">
              <span className="text-2xl font-bold">4</span>
            </div>
            <h4 className="text-lg font-bold mb-2">Start Serving</h4>
            <p className="text-sm">
              Customers order from their table, you manage orders in real-time
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <Card className="p-12 text-center border-2">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join restaurants already using our platform to streamline their
            operations and improve customer experience.
          </p>
          <Link href="/admin/signup">
            <Button className="text-white font-semibold shadow-lg px-8 py-6 text-lg">
              Sign Up Your Restaurant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t-2 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-sm">
            © 2025 Restaurant Manager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
