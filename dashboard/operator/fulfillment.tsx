'use client';
import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function FulfillmentPage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lowStockAlerts, setLowStockAlerts] = useState<string[]>([]);

  useEffect(() => {
    async function fetchQueue() {
      try {
        const { data, error } = await supabase.from("orders").select("id, item, status").neq("status", "Fulfilled");
        if (error) throw error;
        setQueue(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQueue();
  }, []);

  useEffect(() => {
    const subscription = supabase
      .channel("inventory-updates")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "inventory" }, (payload) => {
        if (payload.new.stock_level < 5) {
          setLowStockAlerts((prev) => [...prev, payload.new.item]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const memoizedQueue = useMemo(() => queue, [queue]);

  return (
    <main className="p-10 max-w-4xl mx-auto bg-white rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-center">📦 Fulfillment Queue</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {lowStockAlerts.length > 0 && (
        <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-lg">
          <h2 className="font-bold">⚠️ Low Stock Alerts:</h2>
          <ul className="list-disc ml-4">
            {lowStockAlerts.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {loading ? (
        <p className="text-gray-500 text-center">Loading...</p>
      ) : (
        <ul className="divide-y divide-gray-300">
          {memoizedQueue.map(({ id, item, status }) => (
            <li key={id} className="p-4 flex justify-between items-center">
              <span className="text-lg font-medium">{item}</span>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                  status === "pending"
                    ? "text-yellow-600 bg-yellow-100 border-yellow-300"
                    : "text-green-600 bg-green-100 border-green-300"
                }`}
              >
                {status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}