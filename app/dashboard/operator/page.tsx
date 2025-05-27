'use client';
import ProtectedLayout from "../../../components/ProtectedLayout";
import { useUser } from "../../../hooks/useUser";
import React, { useEffect, useState } from "react";
import {
  getOperatorOrders,
  updateOrderStatus,
  assignOrderToOperator,
} from "../../../lib/operatorOrders";
import { Order } from "../../../types/types";

export default function OperatorDashboardPage() {
  const { user, loading } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getOperatorOrders(user.id)
        .then((data) => setOrders(data))
        .catch((e) => setError(e.message));
    }
  }, [user]);

  return (
    <ProtectedLayout>
      <main className="p-10 max-w-6xl mx-auto space-y-10">
        <header>
          <h1 className="text-4xl font-bold text-gray-900">🛠 Operator Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage assigned orders and track progress.</p>
        </header>

        {error && <p className="text-red-500">{error}</p>}

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">📋 Assigned Orders</h2>
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">Order ID: {order.id}</p>
                  <p className="text-sm text-gray-500">Client: {order.client_id}</p>
                </div>
                <span className={`px-4 py-1 rounded-full text-sm font-medium border ${order.status === "pending" ? "text-yellow-600 bg-yellow-100 border-yellow-300" : "text-green-600 bg-green-100 border-green-300"}`}>
                  {order.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </ProtectedLayout>
  );
}