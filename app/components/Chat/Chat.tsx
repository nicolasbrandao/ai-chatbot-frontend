"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ChatHistory, Message } from "@/types/models/shared";
import {
  useChatHistory,
  useCreateChatHistory,
  usePostChatMessage,
  useUpdateChatHistory,
} from "@/app/hooks/useChatApi";
import ChatBubble from "../ChatBuble";
import { useRouter } from "next/navigation";

export default function Chat({ id }: { id?: string | number }) {
  const { data: fetchedChatHistory, isLoading: isChatHistoryLoading } =
    useChatHistory(id?.toString() ?? " ");

  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [chat, setChat] = useState<Message[]>([]);
  const [isNewMessageLoading, setIsNewMessageLoading] = useState(false);
  const updateChatHistory = useUpdateChatHistory();
  const [chatHistory, setChatHistory] = useState<Message[][]>();
  const { push } = useRouter();
  const createChatHistory = useCreateChatHistory();
  const { data: session } = useSession();
  const user_email = session?.user?.email!;

  useEffect(() => {
    console.log({ fetchedChatHistory });
    fetchedChatHistory && setChatHistory(fetchedChatHistory?.chat_history);
  }, [fetchedChatHistory]);

  useEffect(() => {
    console.log({ answer });
  }, [answer]);

  useEffect(() => {
    if (chatHistory) {
      setChat(chatHistory.flat());
    }
  }, [chatHistory]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setIsNewMessageLoading(true);
    e.preventDefault();
    const body = JSON.stringify({
      message,
      history: chatHistory,
      SystemMessage: "Act like a helpful assistant",
    });

    let aiResponse = "";

    const res = await fetch("http://localhost:3001/api2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Transfer-Encoding": "chunked",
      },
      body,
    });

    if (!res.ok) throw new Error("Could not send message");

    const reader = res.body?.getReader();
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        aiResponse += new TextDecoder().decode(value);
        setAnswer(aiResponse);
      }
    }

    setIsNewMessageLoading(false);

    const newMessages: Message[] = [
      {
        type: "USER",
        message,
        createdAt: Date.now(),
      },
      {
        type: "AI",
        message: aiResponse,
        createdAt: Date.now(),
      },
    ];

    setChatHistory((prev) => [...(prev ?? []), newMessages]);
    setAnswer("");
  };

  const createNewChat = async () =>
    createChatHistory.mutateAsync({ user_email, chat_history: chatHistory });

  const updateChat = async () =>
    updateChatHistory.mutateAsync({
      user_email,
      chat_history: chatHistory ? chatHistory : [],
      id: id?.toString()!,
    });

  const handleSave = async () => {
    const { id: savedId } = !id ? await createNewChat() : await updateChat();
    push(`/chat/${id ?? savedId}`);
    console.log({ savedId });
  };

  return (
    <section className="flex flex-col w-full py-8 px-4">
      <div className="flex flex-col gap-4 w-full md:max-w-[800px] mx-auto">
        {chat
          .filter((message) => message.type !== "SYSTEM")
          .map((message, index) => {
            return <ChatBubble message={message} key={`${index}`} />;
          })}
        {isNewMessageLoading && (
          <ChatBubble
            message={{ type: "AI", message: answer, createdAt: Date.now() }}
          />
        )}
        <form className="flex gap-4" onSubmit={handleSubmit}>
          <textarea
            className="textarea textarea-bordered w-full resize-none"
            onChange={(e) => handleChange(e)}
            placeholder="Write your message here..."
          />
          <button
            disabled={isNewMessageLoading}
            className="btn h-[100px]"
            type="submit"
            name="message"
          >
            {isNewMessageLoading && (
              <span className="loading loading-spinner"></span>
            )}
            Send
          </button>
        </form>
      </div>
      <button
        onClick={handleSave}
        disabled={isNewMessageLoading}
        className="btn "
      >
        Salve Chat
      </button>
    </section>
  );
}
