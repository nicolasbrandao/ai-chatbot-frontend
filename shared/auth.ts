import GoogleProvider from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";

const googleConfig = GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
});

const supabaseConfig = SupabaseAdapter({
  url: process.env.SUPABASE_URL ?? "",
  secret: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
});

const authConfig = {
  providers: [googleConfig],
  adapter: supabaseConfig,
};

export default authConfig;
