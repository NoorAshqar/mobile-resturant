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
  createdAt?: string;
  updatedAt?: string;
  submittedAt?: string;
  sessionKey?: string;
}
