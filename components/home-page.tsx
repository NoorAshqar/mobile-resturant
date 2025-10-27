'use client';

import Link from "next/link";

import { CustomerMenu } from "./customer-menu";
import { type MenuItemType } from "./menu-item";
import { Toaster } from "./ui/sonner";

const mockMenuItems: MenuItemType[] = [
  {
    id: "1",
    name: "Classic Cheeseburger",
    description:
      "Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce.",
    price: 12.99,
    image:
      "https://images.unsplash.com/photo-1722125680299-783f98369451?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "Burgers",
    popular: true,
  },
  {
    id: "2",
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomatoes, and basil on wood-fired crust.",
    price: 14.99,
    image:
      "https://images.unsplash.com/photo-1727198826083-6693684e4fc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "Pizza",
    popular: true,
    vegetarian: true,
  },
  {
    id: "3",
    name: "Creamy Pasta Carbonara",
    description:
      "Classic Italian pasta with bacon, eggs, and parmesan cheese.",
    price: 16.99,
    image:
      "https://images.unsplash.com/photo-1749169337822-d875fd6f4c9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "Pasta",
  },
  {
    id: "4",
    name: "Caesar Salad",
    description:
      "Crisp romaine lettuce, parmesan, croutons, and Caesar dressing.",
    price: 9.99,
    image:
      "https://images.unsplash.com/photo-1651352650142-385087834d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "Salads",
    vegetarian: true,
  },
  {
    id: "5",
    name: "Sushi Platter",
    description: "Assorted fresh sushi rolls with wasabi and ginger.",
    price: 24.99,
    image:
      "https://images.unsplash.com/photo-1700324822763-956100f79b0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "Sushi",
    popular: true,
  },
  {
    id: "6",
    name: "Beef Tacos",
    description: "Soft tacos with seasoned beef, salsa, and fresh toppings.",
    price: 11.99,
    image:
      "https://images.unsplash.com/photo-1757774551171-91143e145b0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "Tacos",
  },
  {
    id: "7",
    name: "Bacon Cheeseburger",
    description: "Double beef patty with crispy bacon and smoky BBQ sauce.",
    price: 15.99,
    image:
      "https://images.unsplash.com/photo-1722125680299-783f98369451?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "Burgers",
  },
  {
    id: "8",
    name: "Pepperoni Pizza",
    description: "Classic pepperoni with mozzarella on signature crust.",
    price: 16.99,
    image:
      "https://images.unsplash.com/photo-1727198826083-6693684e4fc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "Pizza",
  },
  {
    id: "9",
    name: "Greek Salad",
    description:
      "Fresh vegetables with feta cheese, olives, and vinaigrette.",
    price: 10.99,
    image:
      "https://images.unsplash.com/photo-1651352650142-385087834d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "Salads",
    vegetarian: true,
  },
  {
    id: "10",
    name: "Spicy Tuna Roll",
    description: "Fresh tuna with spicy mayo and crisp cucumber.",
    price: 13.99,
    image:
      "https://images.unsplash.com/photo-1700324822763-956100f79b0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "Sushi",
  },
];

const selectedRestaurant = {
  id: "1",
  name: "The Burger Palace",
  cuisine: "American - Burgers - Fast Food",
  rating: 4.6,
  deliveryTime: "25-35 min",
  deliveryFee: 2.99,
};

export function HomePage() {
  return (
    <div className="min-h-screen">
      <Toaster />

      <CustomerMenu restaurant={selectedRestaurant} menuItems={mockMenuItems} />

      <div className="fixed bottom-5 left-1/2 -translate-x-1/2">
        <Link
          href="/admin"
          className="rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg transition hover:bg-black"
        >
          Admin login
        </Link>
      </div>
    </div>
  );
}
