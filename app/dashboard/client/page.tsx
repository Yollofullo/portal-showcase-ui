"use client";
import ProtectedLayout from '../../../components/ProtectedLayout';
import { useUser } from '../../../hooks/useUser';
import React, { useEffect, useState } from 'react';
import { getClientOrders } from '../../../lib/clientOrders';
import { Order } from '../../../types/types';

export default function ClientDashboardPage() {
  const { user, loading } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      getClientOrders(user.id)
        .then((data) => setOrders(data))
        .catch(e => setError(e.message));
    }
  }, [user]);

  return (
    <ProtectedLayout roles={['client']}>
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-3xl">
          <h1 className="text-3xl font-bold mb-6 text-center">Welcome, Client!</h1>
          {error && <div className="mb-4 text-red-600 text-center font-semibold">{error}</div>}
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Order ID</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Created At</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan={3} className="text-center py-8 text-gray-500">You have no orders yet.</td></tr>
                )}
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="p-2 border font-mono">{order.id}</td>
                    <td className="p-2 border">{order.status}</td>
                    <td className="p-2 border">{new Date(order.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </ProtectedLayout>
  );
}
