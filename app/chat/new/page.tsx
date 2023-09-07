"use client";
import Chat from "@/app/components/Chat/Chat";
import { useChat } from "@/app/hooks/useChat";

export default function Page({ params }: { params: { id: string } }) {
  const chat = useChat();
  const { chatHistory } = chat;

  const title = chatHistory?.title !== "" ? chatHistory?.title : "Untitled";

  return (
    <>
      <h1 className="text-3xl sticky top-0 z-50">{title}</h1>
      <Chat {...chat} />
    </>
  );
}
