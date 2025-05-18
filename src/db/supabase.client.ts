import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
// Service role client bypasses RLS - use only in server-side code
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
export type SupabaseClient = typeof supabaseClient;

export const DEFAULT_USER_ID = "ea55fc94-ba42-47fc-bc46-e75664a8b2ba";
