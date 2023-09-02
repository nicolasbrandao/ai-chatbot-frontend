import GoogleProvider from "next-auth/providers/google";
import {
  SupabaseAdapter,
  SupabaseAdapterOptions,
} from "@auth/supabase-adapter";
import { AuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";

const googleConfig = GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
});

const supabaseOptions: SupabaseAdapterOptions = {
  secret: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  url: process.env.SUPABASE_URL ?? "",
};

const supabaseConfig = SupabaseAdapter(supabaseOptions);

const authConfig: AuthOptions = {
  providers: [googleConfig],
  // TODO: check out how to fix this
  adapter: supabaseConfig as Adapter,
};

export default authConfig;
