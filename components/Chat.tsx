"use client";

import { Message } from "@/types/models/shared";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

export default function Chat() {
  const [chat, setChat] = useState<Message[]>([]);
  const [history, setHistory] = useState<Message[][]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const [answer, setAnswer] = useState("")

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch("http://localhost:3001/api2/chat-history");
        if (res.ok) {
          const chats = await res.json();
          const [firstChat, ...rest] = chats;
          const { chat_history } = firstChat;
          setHistory(chat_history);
        } else {
          throw new Error("Request failed");
        }
      } catch (e) {
        console.log("Error: ", e);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    const chat_history = history;
    setHistory(chat_history);
    const chatHistory = chat_history.flat();
    setChat(chatHistory);
  }, [history]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setIsLoading(true)
    e.preventDefault();
    const body = JSON.stringify({
      message,
      history: history,
      SystemMessage: "Act like a helpful assistant",
    });

    let aiResponse = "";

    const res = await fetch("http://localhost:3001/api2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Transfer-Encoding":'chunked',
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
        setAnswer(aiResponse)
      }
    }

    setIsLoading(false)

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

    setHistory((prev) => [...prev, newMessages]);
    setAnswer("")
  };


  return (
    <section className="flex flex-col w-full py-8 px-4">
      <div className="flex flex-col gap-4 w-full md:max-w-[800px] mx-auto">
        {chat
          .filter((message) => message.type !== "SYSTEM")
          .map((message, index) => {
            return <ChatBubble message={message} key={`${index}`} />;
          })}
        {isLoading && <ChatBubble message={{type:"AI", message: answer, createdAt: Date.now()}} /> }
        <form className="flex gap-4" onSubmit={handleSubmit}>
          <textarea
            className="textarea textarea-bordered w-full resize-none"
            onChange={(e) => handleChange(e)}
            placeholder="Write your message here..."
          />
          <button disabled={isLoading} className="btn h-[100px]" type="submit" name="message">
            {isLoading && (<span className="loading loading-spinner"></span>)}
            Send
          </button>
        </form>
      </div>
    </section>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const session = useSession();
  const aiImage = "https://picsum.photos/id/237/200/300";
  const defaultImage = "https://picsum.photos/id/252/200/300";
  const humanImage = session?.data?.user?.image ?? defaultImage;
  const userName = session?.data?.user?.name ?? "User";
  const isAiMessage = message.type === "AI";
  return (
    <>
      <div className={`chat ${isAiMessage ? "chat-start" : "chat-end"}`}>
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <Image
              src={isAiMessage ? aiImage : humanImage}
              alt="AI"
              width={30}
              height={30}
            />
          </div>
        </div>
        <div className="chat-header">
          {isAiMessage ? "AI" : userName}
          <time className="text-xs opacity-50">
            {new Date(message.createdAt).toISOString()}
          </time>
        </div>
        <div className="chat-bubble">{message.message}</div>
        <div className="chat-footer opacity-50">Message Status</div>
      </div>
    </>
  );
}
