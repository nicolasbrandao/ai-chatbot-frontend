import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { headers } from "next/headers";

const googleConfig = GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
});

const authConfig: NextAuthOptions = {
  providers: [googleConfig],
};

export default authConfig;

export function getOriginPath() {
  const headerObj = headers();
  const origin = headerObj.get(ORIGIN_URL_KEY) ?? "";
  return origin;
}

export function makeRedirectURL(origin: string) {
  return `${NO_SESSION_REDIRECT}${origin}`;
}

export const ORIGIN_URL_KEY = "x-url";
const NO_SESSION_REDIRECT = "/auth/signin?callbackUrl=";
