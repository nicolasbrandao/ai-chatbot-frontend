import Chat from "@/app/components/Chat";
import authConfig, { getOriginPath, makeRedirectURL } from "@/shared/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authConfig);
  const origin = getOriginPath();
  if (!session) return redirect(makeRedirectURL(origin));
  return <Chat />;
}
