// Replace VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY with actual values if not set via environment
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function joinWaitingList(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check how many users are already on the list (for the 20% discount message)
    const { count } = await supabase
      .from("waiting_list")
      .select("*", { count: "exact", head: true });

    const isInFirst20 = (count ?? 0) < 20;

    const { error } = await supabase
      .from("waiting_list")
      .insert([{ email }]);

    if (error) {
      if (error.code === "23505") {
        return { success: false, message: "This email is already on the waiting list." };
      }
      return { success: false, message: "Something went wrong. Please try again." };
    }

    const successMsg = isInFirst20
      ? "You're on the list! As one of our first 20 users, you'll get a 20% lifetime discount."
      : "You're on the waiting list! We'll notify you when ThoughtScope launches.";

    return { success: true, message: successMsg };
  } catch {
    return { success: false, message: "Connection error. Please try again later." };
  }
}
