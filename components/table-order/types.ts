"use client";

export type ThemeMode = "light" | "dark";

export interface TableOrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface TableOrderDetails {
  id: string;
  restaurant: {
    id: string;
    name: string;
    cuisine: string;
    themePalette?: string;
    themeMode?: ThemeMode;
    paymentConfig?: {
      lahza?: {
        publicKey: string | null;
        currency?: string | null;
      };
    };
  };
  table: {
    id: string;
    number: number;
    capacity: number;
  };
  items: TableOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  paid?: boolean;
  paidAt?: string;
  payment?: TableOrderPayment;
  createdAt?: string;
  updatedAt?: string;
  submittedAt?: string;
  sessionKey?: string;
}

export type TableOrderPaymentStatus = "unpaid" | "pending" | "paid" | "failed";

export interface TableOrderPayment {
  method: "cash" | "card" | "lahza" | null;
  status: TableOrderPaymentStatus;
  reference: string | null;
}
