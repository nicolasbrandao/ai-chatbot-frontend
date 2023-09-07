import React from "react";
import { Message } from "@/types/models/shared";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

interface SimpleChatProps {
  chat_history: Message[][];
}

const ChatPreview: React.FC<SimpleChatProps> = ({ chat_history }) => {
  const flatChatHistory = chat_history.flat();
  const lastMessage = flatChatHistory.slice(-1);

  return (
    <div className="flex flex-col gap-4 w-full md:max-w-[800px] mx-auto">
      {lastMessage.map((message, index) => (
        <PreviewCard message={message.message.slice(0, 25)} key={index} />
      ))}
    </div>
  );
};

export default ChatPreview;

type PreviewCardProps = {
  message: string;
  key?: number | string;
};

const PreviewCard = ({ message, key }: PreviewCardProps) => {
  return (
    <div className="flex gap-2 items-center justify-between w-full" key={key}>
      <ChatBubbleLeftIcon className="h-5 w-5" />
      {/* TODO: Use a message title instead of spliting the message */}
      <p className="rounded">{message}</p>
    </div>
  );
};
