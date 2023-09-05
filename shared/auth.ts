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
  callbacks: {
    async jwt({ token, account, profile, user, session }) {
      console.log(" @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ");
      console.log({ token });
      console.log({ account });
      console.log({ profile });
      session.accessToken = token?.id_token;
      console.log(" @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      return { ...token, ...user };
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token and user id from a provider.
      console.log(" ################################");
      console.log({ session });
      console.log({ token });
      console.log({ user });
      console.log(" ################################");

      session.accessToken = token?.id_token;

      return {
        ...session,
        user: { ...session?.user, id: user?.id },
      };
    },
  },
  adapter: supabaseConfig as Adapter,
};

export default authConfig;
