"use client";
import Chat from "@/app/components/Chat/Chat";
import ChatHeader from "@/app/components/Chat/ChatHeader";
import { useChat } from "@/app/hooks/useChat";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const chat = useChat(parseInt(id));
  const { chatHistory, isChatHistoryLoading } = chat;
  console.log({ chatHistory });

  const title =
    chatHistory?.title == undefined || chatHistory?.title === ""
      ? "Untitled"
      : chatHistory?.title;

  return !isChatHistoryLoading ? (
    <>
      <ChatHeader title={title} />
      <Chat {...chat} />
    </>
  ) : (
    <div className="loading loading-lg m-auto" />
  );
}
