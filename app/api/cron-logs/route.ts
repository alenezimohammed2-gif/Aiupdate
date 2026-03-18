import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("cron_logs")
      .select("*")
      .order("ran_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ logs: [] });
    }

    return NextResponse.json({ logs: data || [] });
  } catch {
    return NextResponse.json({ logs: [] });
  }
}
