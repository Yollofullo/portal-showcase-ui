import { supabase } from "../lib/supabaseClient";

export async function getOperatorOrders(operatorId: string) {
  // status IN ('unassigned', 'in-progress') AND (operator_id IS NULL OR matches current user)
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .in("status", ["unassigned", "in-progress"])
    .or(`operator_id.is.null,operator_id.eq.${operatorId}`);
  if (error) throw error;
  return data || [];
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw error;
}

export async function assignOrderToOperator(orderId: string, operatorId: string) {
  const { error } = await supabase
    .from("orders")
    .update({ operator_id: operatorId })
    .eq("id", orderId);
  if (error) throw error;
}
