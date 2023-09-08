import React from "react";
import { Message } from "@/types/models/shared";
import { ChatBubbleLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useDeleteChatHistory } from "../hooks/useChatApi";

interface SimpleChatProps {
  chat_history: Message[][];
  id: number | string;
}

const ChatPreview: React.FC<SimpleChatProps> = ({
  chat_history,
  id,
}: SimpleChatProps) => {
  const flatChatHistory = chat_history ? chat_history.flat() : [];
  const lastMessage = flatChatHistory.slice(-1);
  return (
    <div className="flex flex-col gap-4 w-full md:max-w-[800px] mx-auto">
      {lastMessage.map((message, index) => (
        <PreviewCard
          message={message.message.slice(0, 25)}
          id={id}
          key={index}
        />
      ))}
    </div>
  );
};

export default ChatPreview;

type PreviewCardProps = {
  message: string;
  id: number | string;
};

const PreviewCard = ({ message, id }: PreviewCardProps) => {
  return (
    <div className="flex gap-2 items-center justify-between w-full">
      <ChatBubbleLeftIcon className="h-5 w-5" />
      {/* TODO: Use a message title instead of spliting the message */}
      <p className="rounded">{message}</p>
      <DeleteChatButton id={id} />
    </div>
  );
};

const DeleteChatButton = ({ id }: { id: number | string }) => {
  const deleteChatHistory = useDeleteChatHistory();

  const handleDelete = async () => {
    try {
      await deleteChatHistory.mutateAsync(`${id}`);
      alert("Deleted Successfully");
    } catch (e) {
      alert("Something went wrong");
      console.log({ e });
    }
  };
  
  return (
    <button className="btn">
      <TrashIcon
        className="h-5 w-5 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
      />
    </button>
  );
};
