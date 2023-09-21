"use client";
import Chat from "@/app/components/Chat/Chat";
import { useChat } from "@/app/hooks/useChat";

export default function Page() {
  const chat = useChat();
  return (
    <>
      <Chat {...chat} />
    </>
  );
}
