import { NextRequest, NextResponse } from "next/server";
import { getSupabase, getSupabaseAdmin } from "@/lib/supabase";
import { DEFAULT_SETTINGS } from "@/lib/settings-types";

const SETTINGS_ID = "global";

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", SETTINGS_ID)
      .single();

    if (error || !data) {
      return NextResponse.json({
        id: SETTINGS_ID,
        ...DEFAULT_SETTINGS,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      id: SETTINGS_ID,
      ...DEFAULT_SETTINGS,
      updated_at: new Date().toISOString(),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    const settings = {
      id: SETTINGS_ID,
      selected_model: body.selected_model || DEFAULT_SETTINGS.selected_model,
      selected_image_model: body.selected_image_model || DEFAULT_SETTINGS.selected_image_model,
      keywords: body.keywords || [],
      custom_instructions_include: body.custom_instructions_include || "",
      custom_instructions_exclude: body.custom_instructions_exclude || "",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("settings")
      .upsert(settings, { onConflict: "id" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
