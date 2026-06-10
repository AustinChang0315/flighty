import { createClient } from "@supabase/supabase-js";

export type FlightRecord = {
  id: string;
  from_code: string;
  to_code: string;
  trip_type: "one-way" | "round-trip";
  flight_date: string | null;
  created_at: string;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = url && key ? createClient(url, key) : null;
export const isSupabaseConfigured = Boolean(url && key);
