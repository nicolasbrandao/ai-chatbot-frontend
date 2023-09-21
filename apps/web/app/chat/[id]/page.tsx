"use client";
import Chat from "@/app/components/Chat/Chat";
import { useChat } from "@/app/hooks/useChat";

export default function Page() {
  const chat = useChat();
  const { isChatHistoryLoading, chatHistory } = chat;

  console.log({ chatHistoryOnComponent: chatHistory });
  return !isChatHistoryLoading ? (
    <>
      <Chat {...chat} />
    </>
  ) : (
    <div className="loading loading-lg m-auto" />
  );
}
