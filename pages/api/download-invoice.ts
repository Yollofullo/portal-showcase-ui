import { supabase } from "../../lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(request) {
  const user = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const { data, error } = await supabase.from("invoices").select("file_url").eq("customer_id", user.id).single();
  if (error || !data) return NextResponse.json({ error: "Unauthorized or invoice not found" }, { status: 403 });

  return NextResponse.redirect(data.file_url);
}