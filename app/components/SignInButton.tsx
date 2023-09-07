"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function SignInButton() {
  const { data: session } = useSession();

  if (session && session.user) {
    return (
      <button className="btn" onClick={() => signOut()}>
        Sign Out
      </button>
    );
  }

  return (
    <button className="btn" onClick={() => signIn()}>
      Sign In
    </button>
  );
}
