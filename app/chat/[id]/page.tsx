"use client";
import Chat from "@/app/components/Chat/Chat";
import { useChat } from "@/app/hooks/useChat";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const chat = useChat(id);
  const { chatHistory, isChatHistoryLoading } = chat;
  console.log({ chatHistory });

  const title = chatHistory?.title !== "" ? chatHistory?.title : "Untitled";
  return !isChatHistoryLoading ? (
    <>
      <h1 className="text-3xl sticky top-0 z-50">{title}</h1>
      <Chat {...chat} />
    </>
  ) : (
    <div className="loading loading-lg"></div>
  );
}
