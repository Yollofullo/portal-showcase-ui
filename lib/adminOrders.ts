import { supabase } from "../lib/supabaseClient";

export async function getAllOrders() {
  // Optionally join with users table for client/operator info
  const { data, error } = await supabase
    .from("orders")
    .select("*", { count: "exact" });
  if (error) throw error;
  return data || [];
}

export async function updateOrderAdmin(orderId, values) {
  const { error } = await supabase
    .from("orders")
    .update(values)
    .eq("id", orderId);
  if (error) throw error;
}
