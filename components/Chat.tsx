"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useState } from "react";
// import { BaseMessage } from "langchain/schema";

export default function Chat() {
  const [chat, setChat] = useState([])
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    })

    const newChat = await res.json();

    setChat((chat) => [...chat, newChat])
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <section className="flex flex-col w-full py-8 px-4">
      <div className="flex flex-col gap-4 w-full md:max-w-[800px] mx-auto">
        {chat.map((message, index) => {
          return (
            <ChatBubble message={message} key={`${index}`}/>
          )
        })}
        
        <form className="flex gap-4" onSubmit={handleSubmit}>
          <textarea
            className="textarea textarea-bordered w-full resize-none"
            onChange={handleChange}
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

// FIXME: type any
function ChatBubble({message}: any) {
  const aiImage = "https://picsum.photos/id/237/200/300";
  const humanImage = "https://picsum.photos/id/265/200/300";
  return (
    <>
      <div className="chat chat-start">
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <Image
              src="https://picsum.photos/id/237/200/300"
              alt="AI"
              width={30}
              height={30}
            />
          </div>
        </div>
        <div className="chat-header">
          Obi-Wan Kenobi
          <time className="text-xs opacity-50">12:45</time>
        </div>
        <div className="chat-bubble">You were the Chosen One!</div>
        <div className="chat-footer opacity-50">Delivered</div>
      </div>
    </>
  );
}
