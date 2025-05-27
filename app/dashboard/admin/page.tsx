"use client";
import ProtectedLayout from '../../../components/ProtectedLayout';
import { useUser } from '../../../hooks/useUser';
import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderAdmin } from '../../../lib/adminOrders';
import { Order } from '../../../types/types';

export default function AdminDashboardPage() {
  const { user, loading } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    getAllOrders()
      .then((data) => setOrders(data))
      .catch(e => setError(e.message));
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdating(orderId);
    setError('');
    try {
      await updateOrderAdmin(orderId, { status });
      setOrders(orders => orders.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (e: any) {
      setError(e.message);
    }
    setUpdating(null);
  };

  const handleOperatorChange = async (orderId: string, operatorId: string) => {
    setUpdating(orderId);
    setError('');
    try {
      await updateOrderAdmin(orderId, { operator_id: operatorId });
      setOrders(orders => orders.map(o => o.id === orderId ? { ...o, operator_id: operatorId } : o));
    } catch (e: any) {
      setError(e.message);
    }
    setUpdating(null);
  };

  // For demo, just use a static list of operator IDs
  const operatorOptions = [
    { id: '', label: 'Unassigned' },
    { id: 'operator1', label: 'Operator 1' },
    { id: 'operator2', label: 'Operator 2' },
    { id: 'operator3', label: 'Operator 3' },
  ];

  return (
    <ProtectedLayout roles={['admin']}>
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-5xl">
          <h1 className="text-3xl font-bold mb-6 text-center">Welcome, Admin!</h1>
          {error && <div className="mb-4 text-red-600 text-center font-semibold">{error}</div>}
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Order ID</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Created At</th>
                  <th className="p-2 border">Client ID</th>
                  <th className="p-2 border">Operator</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500">No orders found.</td></tr>
                )}
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="p-2 border font-mono">{order.id}</td>
                    <td className="p-2 border">
                      <select
                        className="border rounded px-2 py-1"
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        disabled={updating === order.id}
                      >
                        <option value="unassigned">Unassigned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="p-2 border">{new Date(order.created_at).toLocaleString()}</td>
                    <td className="p-2 border">{order.client_id}</td>
                    <td className="p-2 border">
                      <select
                        className="border rounded px-2 py-1"
                        value={order.operator_id || ''}
                        onChange={e => handleOperatorChange(order.id, e.target.value)}
                        disabled={updating === order.id}
                      >
                        {operatorOptions.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
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
