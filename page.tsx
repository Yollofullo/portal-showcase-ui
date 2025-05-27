import React from "react";
import { getOrders } from "./exampleUsage";

// Server Component to fetch and render orders
const OrdersList = async () => {
  // Ensure Supabase keys are loaded from .env.local
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="text-red-600 font-semibold">
        Supabase environment variables are missing. Please check your .env.local file.
      </div>
    );
  }

  let orders: { id?: string; customer?: string; status?: string }[] = [];
  try {
    orders = await getOrders();
  } catch (error) {
    return (
      <div className="text-red-600 font-semibold">
        Failed to load orders: {String(error)}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-gray-500 italic mt-4">
        No orders found.
      </div>
    );
  }

  return (
    <ul className="grid gap-4 mt-6 sm:grid-cols-2 md:grid-cols-3">
      {orders.map((order, idx) => (
        <li
          key={order.id || idx}
          className="bg-white rounded shadow p-4 border border-gray-200"
        >
          <div className="font-bold">Order #{order.id ?? "N/A"}</div>
          <div className="text-sm text-gray-700">Customer: {order.customer ?? "Unknown"}</div>
          <div className="text-sm text-gray-500">Status: {order.status ?? "N/A"}</div>
        </li>
      ))}
    </ul>
  );
};

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Welcome to the Operator Fulfillment Portal
      </h1>
      <OrdersList />
    </main>
  );
}
