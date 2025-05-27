"use client";
import ProtectedLayout from "../../../components/ProtectedLayout";
import { useUser } from "../../../hooks/useUser";
import React, { useEffect, useState, useMemo } from "react";
import { getAllOrders, updateOrderAdmin } from "../../../lib/adminOrders";
import { Order } from "../../../types/types";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const { user, loading } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (e: any) {
        setError("Failed to fetch orders. Please try again.");
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchOrders();

    // Optionally unsubscribe on unmount
    return () => {};
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdating(orderId);
    setError(null);
    try {
      await updateOrderAdmin(orderId, { status });
      setOrders((orders) =>
        orders.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      toast.success("Status updated successfully!");
    } catch (e: any) {
      toast.error("Error updating status. Please check your connection.");
    }
    setUpdating(null);
  };

  const handleOperatorChange = async (orderId: string, operatorId: string) => {
    setUpdating(orderId);
    setError(null);
    try {
      await updateOrderAdmin(orderId, { operator_id: operatorId });
      setOrders((orders) =>
        orders.map((o) =>
          o.id === orderId ? { ...o, operator_id: operatorId } : o
        )
      );
      toast.success("Operator assigned successfully!");
    } catch (e: any) {
      toast.error("Failed to assign operator. Please try again.");
    }
    setUpdating(null);
  };

  const memoizedOrders = useMemo(() => orders, [orders]);

  return (
    <ProtectedLayout roles={["admin"]}>
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-6xl">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
          {error && <p className="text-red-500 p-2 border border-red-300">{error}</p>}
          {loadingOrders && <p className="text-gray-500">Loading orders...</p>}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Order ID</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Operator</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {memoizedOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="p-2 border">{order.id}</td>
                    <td className="p-2 border">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="border p-1 rounded"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                      </select>
                      {updating === order.id && <span className="ml-2 text-gray-500">Updating...</span>}
                    </td>
                    <td className="p-2 border">
                      <select
                        value={order.operator_id}
                        onChange={(e) => handleOperatorChange(order.id, e.target.value)}
                        className="border p-1 rounded"
                      >
                        <option value="">Unassigned</option>
                        <option value="operator1">Operator 1</option>
                        <option value="operator2">Operator 2</option>
                      </select>
                      {updating === order.id && <span className="ml-2 text-gray-500">Updating...</span>}
                    </td>
                    <td className="p-2 border">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                        onClick={() => console.log("Expanding order details")}
                      >
                        Expand
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <toast.Toaster />
    </ProtectedLayout>
  );
}
