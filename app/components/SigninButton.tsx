"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function SigninButton() {
  const { data: session } = useSession();

  if (session && session.user) {
    return <button onClick={() => signOut()}>Sign Out</button>;
  }

  return <button onClick={() => signIn()}>Login with Google</button>;
}
