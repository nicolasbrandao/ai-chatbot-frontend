"use client";
import Chat from "@/app/components/Chat/Chat";
import ChatHeader from "@/app/components/Chat/ChatHeader";
import { useChat } from "@/app/hooks/useChat";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const chat = useChat(id);
  const { chatHistory, isChatHistoryLoading } = chat;
  console.log({ chatHistory });

  const title = chatHistory?.title ?? "Untitled";
  return !isChatHistoryLoading ? (
    <>
      <ChatHeader title={title} />
      <Chat {...chat} />
    </>
  ) : (
    <div className="loading loading-lg m-auto" />
  );
}
