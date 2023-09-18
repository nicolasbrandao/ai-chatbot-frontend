"use client";

import { Message } from "@/types/models/shared";
import ChatBubble from "../ChatBubble";
import { PaperAirplaneIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { ChangeEvent, FormEvent } from "react";
import TextareaAutosize from "react-textarea-autosize";

interface ChatProps {
  chat: Message[];
  handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSave: () => Promise<void>;
  handleSubmit: (e?: FormEvent<HTMLFormElement> | undefined) => Promise<void>;
  isNewMessageLoading: boolean;
  message: string;
  answer: string;
}

const Chat: React.FC<ChatProps> = ({
  chat,
  handleChange,
  handleSave,
  handleSubmit,
  isNewMessageLoading,
  message,
  answer,
}) => {
  return (
    <section className="flex flex-col w-full h-full md:min-w-[600px]">
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
          <form
            className="flex flex-start bg-base-300 gap-4 p-1 rounded-xl"
            onSubmit={handleSubmit}
          >
            <TextareaAutosize
              className="textarea w-full resize-none"
              value={message}
              onChange={(e) => handleChange(e)}
              onKeyUp={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSubmit();
              }}
              placeholder="Write your message here..."
              minRows={3}
              maxRows={8}
            />
            <div className="flex flex-col gap-1 h-fit mt-auto">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSave();
                }}
                disabled={isNewMessageLoading}
                className="btn"
              >
                <BookmarkIcon className="h-6 w-6" />
              </button>
              <button
                disabled={isNewMessageLoading}
                className="btn"
                type="submit"
                name="message"
              >
                {isNewMessageLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <PaperAirplaneIcon className="h-6 w-6 " />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Chat;
