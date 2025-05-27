'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase.from("orders").select("*");
      if (error) console.error("Error loading orders:", error.message);
      setOrders(data || []);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">📦 Live Orders</h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {orders.map((order) => (
            <li key={order.id} className="p-4 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">ID: {order.id}</span>
                <span className="text-gray-500">Client: {order.client_id}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${order.status === "pending" ? "text-yellow-600 bg-yellow-100 border-yellow-300" : "text-green-600 bg-green-100 border-green-300"}`}>
                {order.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}