import { supabase } from "../lib/supabaseClient";

export async function getClientOrders(clientId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("client_id", clientId);
  if (error) throw error;
  return data || [];
}
