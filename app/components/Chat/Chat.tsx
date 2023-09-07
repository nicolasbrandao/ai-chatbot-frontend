"use client";

import { Message } from "@/types/models/shared";

import ChatBubble from "../ChatBubble";
import { PaperAirplaneIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { ChangeEvent, FormEvent } from "react";

interface ChatPropos {
  chat: Message[];
  handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSave: () => Promise<void>;
  handleSubmit: (e?: FormEvent<HTMLFormElement> | undefined) => Promise<void>;
  isNewMessageLoading: boolean;
  message: string;
  answer: string;
}

const Chat: React.FC<ChatPropos> = ({
  chat,
  handleChange,
  handleSave,
  handleSubmit,
  isNewMessageLoading,
  message,
  answer,
}) => {
  return (
    <section className="flex flex-col w-full h-full">
      <div className="flex flex-col gap-4 w-full md:max-w-[800px] mx-auto">
        <div className="min-h-full">
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
        </div>
        <div className="flex flex-col gap-4 sticky bottom-4">
          <form className="flex gap-4" onSubmit={handleSubmit}>
            <textarea
              className="textarea textarea-bordered w-full resize-none"
              value={message}
              onChange={(e) => handleChange(e)}
              onKeyUp={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSubmit();
              }}
              placeholder="Write your message here..."
            />
            <button
              onClick={handleSave}
              disabled={isNewMessageLoading}
              className="btn h-[100px]"
            >
              <BookmarkIcon className="h-6 w-6" />
            </button>
            <button
              disabled={isNewMessageLoading}
              className="btn h-[100px]"
              type="submit"
              name="message"
            >
              {isNewMessageLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <PaperAirplaneIcon className="h-6 w-6 " />
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Chat;
