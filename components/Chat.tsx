"use client";

import { Message } from "@/types/models/shared";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

export default function Chat() {
  const [chat, setChat] = useState<Message[]>([])
  const [history, setHistory] = useState<Message[][]>([])
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch("/api/chat_history")
        if (res.ok) {
          const chats = await res.json()
          const [firstChat, ...rest] = chats
          const { chat_history } = firstChat;
          setHistory(chat_history)
        } else {
          throw new Error("Request failed")
        }
      } catch (e) {
        console.log('Error: ', e)
      }
    }
    fetchChats();
  }, [])

  useEffect(() => {
    const chat_history = history;
    setHistory(chat_history)
    const chatHistory = chat_history.flat();
    setChat(chatHistory) 
  },[history])

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(history)
  
    const body = JSON.stringify({
      message,
      history: history,
      SystemMessage: "Act like a helpful assistant"
    })
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body,
    })

    if (!res.ok) throw new Error("Could not send message")

    const {response} = await res.json();
    console.log({response})

    
    const newMessages: Message[] = [
      {
        type: "USER",
        message,
        createdAt: Date.now(),
      },
      {
        type: "AI",
        message: response,
        createdAt: Date.now()
      }
    ]

    setHistory((prev) => [...prev, newMessages])
  };

  return (
    <section className="flex flex-col w-full py-8 px-4">
      <div className="flex flex-col gap-4 w-full md:max-w-[800px] mx-auto">
        {chat.filter(message => message.type !== "SYSTEM").map((message, index) => {
          return (
            <ChatBubble message={message} key={`${index}`}/>
          )
        })}
        
        <form className="flex gap-4" onSubmit={handleSubmit}>
          <textarea
            className="textarea textarea-bordered w-full resize-none"
            onChange={(e) => handleChange(e)}
            placeholder="Write your message here..."
          />
          <button className="btn h-[100px]" type="submit" name="message">
            <span className="loading loading-spinner"></span>
            Send
          </button>
        </form>
      </div>
    </section>
  );
}

function ChatBubble({ message }: {message: Message }) {
  const session = useSession()
  const aiImage = "https://picsum.photos/id/237/200/300";
  const defaultImage = "https://picsum.photos/id/252/200/300";
  const humanImage = session?.data?.user?.image ?? defaultImage;
  const userName = session?.data?.user?.name ?? "User";
  const isAiMessage = message.type === "AI"
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
          <time className="text-xs opacity-50">{new Date(message.createdAt).toISOString()}</time>
        </div>
        <div className="chat-bubble">{message.message}</div>
        <div className="chat-footer opacity-50">Message Status</div>
      </div>
    </>
  );
}
