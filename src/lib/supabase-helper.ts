// Temporary type assertion helper until Supabase types regenerate
// This file can be deleted once src/integrations/supabase/types.ts is updated
import { supabase as supabaseClient } from "@/integrations/supabase/client";

// Cast supabase client to any to bypass type errors temporarily
export const supabase = supabaseClient as any;
