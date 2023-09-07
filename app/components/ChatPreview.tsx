import React from "react";
import { Message } from "@/types/models/shared";
import ChatBubble from "./ChatBubble";

interface SimpleChatProps {
  chat_history: Message[][];
}

const ChatPreview: React.FC<SimpleChatProps> = ({ chat_history }) => {
  const flatChatHistory = chat_history.flat();
  const lastMessage = flatChatHistory.slice(-1);

  return (
    <div className="flex flex-col gap-4 w-full md:max-w-[800px] mx-auto">
      {lastMessage.map((message, index) => (
        <ChatBubble message={message} key={index} />
      ))}
    </div>
  );
};

export default ChatPreview;
