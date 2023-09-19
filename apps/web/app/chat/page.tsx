"use client";
import Chat from "@/app/components/Chat/Chat";
import { useChat } from "@/app/hooks/useChat";
import ChatHeader from "../components/Chat/ChatHeader";

export default function Page() {
  const chat = useChat();
  const { chatHistory } = chat;

  const title = chatHistory?.title ?? "Untitled";

  return (
    <>
      <ChatHeader title={title} />
      <Chat {...chat} />
    </>
  );
}
