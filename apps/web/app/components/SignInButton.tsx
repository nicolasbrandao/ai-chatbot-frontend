"use client";

import { BuiltInProviderType } from "next-auth/providers/index";
import { LiteralUnion, signIn } from "next-auth/react";

export default function SignInButton({
  provider,
}: {
  provider: LiteralUnion<BuiltInProviderType, string>;
}) {
  return (
    <button className="btn w-[250px]" onClick={() => signIn(provider)}>
      Sign In with {provider}
    </button>
  );
}
