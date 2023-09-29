import { getServerSession } from "next-auth";
import authConfig from "@/shared/auth";
import SignInButton from "@/app/components/SignInButton";
import { getProviders } from "next-auth/react";
import { redirect } from "next/navigation";

export default async function SignIn() {
  const session = await getServerSession(authConfig);
  if (session) {
    return redirect("/");
  }
  const providers = (await getProviders()) ?? [];

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {Object.values(providers).map((provider) => (
        <div className="mx-auto w-fit" key={provider.name}>
          <SignInButton provider={provider.id} />
        </div>
      ))}
    </div>
  );
}
