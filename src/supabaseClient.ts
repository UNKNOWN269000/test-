import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cduuwyrtbtduumwgmydp.supabase.co";
const supabaseKey = "sb_publishable__vAutZJTV_Cstp-EjSpaeQ_FKc5V_ba";

export const supabase = createClient(supabaseUrl, supabaseKey);
