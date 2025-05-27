'use client';

import React from 'react'; // Add React import for JSX
import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Order = {
  id: string;
  item: string;
  status: string;
};

export default async function FulfillmentPage() {
  const supabaseClient = createServerClient();
  const {
    data: { session },
    error,
  } = await supabaseClient.auth.getSession();

  if (error || !session) {
    redirect('/login/operator');
  }

  if (session.user.user_metadata.role !== 'operator') {
    redirect('/access-denied');
  }

  const [queue, setQueue] = useState<Order[]>([]);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [lowStockAlerts, setLowStockAlerts] = useState<string[]>([]);

  useEffect(() => {
    async function fetchQueue() {
      try {
        const response = await fetch('/api/fulfillment');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data: Order[] = await response.json();
        setQueue(data);
      } catch (err) {
        setErrorState((err as Error).message);
      }
    }

    fetchQueue();

    const orderSubscription = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updatedOrder = payload.new as Order;
          setQueue((prevQueue) => {
            return prevQueue.map((order) =>
              order.id === updatedOrder.id ? updatedOrder : order,
            );
          });
        },
      )
      .subscribe();

    const inventorySubscription = supabase
      .channel('inventory-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'inventory' },
        (payload) => {
          const updatedInventory = payload.new;
          if (updatedInventory && updatedInventory.stock_level < 5) {
            setLowStockAlerts((prevAlerts) => {
              if (!prevAlerts.includes(updatedInventory.item)) {
                return [...prevAlerts, updatedInventory.item];
              }
              return prevAlerts;
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
      supabase.removeChannel(inventorySubscription);
    };
  }, []);

  const markAsFulfilled = async (id: string) => {
    try {
      const response = await fetch('/api/fulfillment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      setQueue((prevQueue) =>
        prevQueue.map((order) =>
          order.id === id ? { ...order, status: 'Fulfilled' } : order,
        ),
      );
    } catch (err) {
      setErrorState((err as Error).message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Fulfillment Queue</h1>
      {errorState && <div className="text-red-500">{errorState}</div>}
      {lowStockAlerts.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          <h2 className="font-bold">Low Stock Alerts:</h2>
          <ul className="list-disc ml-4">
            {lowStockAlerts.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <ul className="mt-4 space-y-2">
        {queue.map((order) => (
          <li
            key={order.id}
            className="border p-2 rounded flex justify-between items-center"
          >
            <div>
              <div className="font-medium">{order.item}</div>
              <div className="text-sm text-gray-600">
                Status: {order.status}
              </div>
            </div>
            {order.status === 'Pending' && (
              <button
                onClick={() => markAsFulfilled(order.id)}
                className="bg-blue-500 text-white px-2 py-1 rounded"
              >
                Mark as Fulfilled
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
