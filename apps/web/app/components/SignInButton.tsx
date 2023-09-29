"use client";

import { BuiltInProviderType } from "next-auth/providers/index";
import { LiteralUnion, signIn, signOut, useSession } from "next-auth/react";

export default function SignInButton({
  provider,
}: {
  provider: LiteralUnion<BuiltInProviderType, string>;
}) {
  const { data: session } = useSession();

  if (session && session.user) {
    return (
      <button className="btn" onClick={() => signOut()}>
        Sign Out
      </button>
    );
  }

  return (
    <button className="btn" onClick={() => signIn(provider)}>
      Sign In with {provider}
    </button>
  );
}
