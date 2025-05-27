'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Order {
  id: string;
  item: string;
  status: string;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const orderSubscription = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updatedOrder = payload.new as Order;
          setOrders((prevOrders) => {
            return prevOrders.map((order) =>
              order.id === updatedOrder.id ? updatedOrder : order,
            );
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Welcome to your Dashboard</h1>
      <h3 className="mt-6 text-lg font-semibold">Your Orders:</h3>
      <ul className="mt-2 space-y-2">
        {orders.map((order) => (
          <li key={order.id} className="border p-2 rounded">
            <div className="font-medium">{order.item}</div>
            <div className="text-sm text-gray-600">Status: {order.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
