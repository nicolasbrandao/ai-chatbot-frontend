"use client";
import Chat from "@/app/components/Chat/Chat";
import { useChatState, useChatActions } from "@/app/hooks/useChat";

export default function Page() {
  const chatState = useChatState();
  const chatActions = useChatActions();
  return (
    <>
      <Chat state={chatState} actions={chatActions} />
    </>
  );
}
