"use client";

import ChatBubble from "../ChatBubble";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import TextareaAutosize from "react-textarea-autosize";
import { ChatActions, ChatState } from "@/app/hooks/useChat";

interface ChatProps {
  state: ChatState;
  actions: ChatActions;
}

const Chat: React.FC<ChatProps> = ({ state, actions }) => {
  const { data, isGenerating, answer, message } = state;

  const history = data?.history ?? [];
  const { handleChange, handleCompletion } = actions;

  return (
    <section className="flex flex-col w-full h-full md:min-w-[600px]">
      <div className="flex flex-col gap-4 w-full md:max-w-[800px] mx-auto">
        <div className="min-h-full">
          {history
            .filter((message) => message.type !== "SYSTEM")
            .map((message, index) => {
              return <ChatBubble message={message} key={`${index}`} />;
            })}
          {isGenerating && (
            <ChatBubble
              message={{ type: "AI", message: answer, createdAt: Date.now() }}
            />
          )}
        </div>
        <div className="flex flex-col gap-4 sticky bottom-4">
          <form
            className="flex flex-start bg-base-300 gap-4 p-1 rounded-xl"
            onSubmit={async (e) => {
              e.preventDefault();
              console.log("submitting");
              await handleCompletion({ message, history });
            }}
          >
            <TextareaAutosize
              className="textarea w-full resize-none"
              value={message}
              onChange={(e) => handleChange(e)}
              onKeyUp={async (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  await handleCompletion({ message, history });
                }
              }}
              placeholder="Write your message here..."
              minRows={3}
              maxRows={8}
            />
            <div className="flex flex-col gap-1 h-fit mt-auto">
              <button
                disabled={isGenerating}
                className="btn"
                type="submit"
                name="message"
              >
                {isGenerating ? (
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
