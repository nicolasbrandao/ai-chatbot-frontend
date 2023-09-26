import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";

const googleConfig = GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
});

const authConfig: AuthOptions = { providers: [googleConfig] };

export default authConfig;
