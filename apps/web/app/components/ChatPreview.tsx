import React, { useState } from "react";
import { ChatBubbleLeftIcon, TrashIcon, PencilSquareIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useDeleteChatHistory } from "../hooks/useChatLocalApi";
import { useChatsActions, useChatsState } from "../hooks/useChats";

interface SimpleChatProps {
  id: number;
}

const ChatPreview: React.FC<SimpleChatProps> = ({
  id,
}: SimpleChatProps) => {
  const { chats } = useChatsState();
  const chat = chats.find((chat) => chat.id === id) ?? {};
  console.log({chat});
  console.log({chats});
  const { title } = chats.find((chat) => chat.id === id) ?? {};
  return (
    <div className="flex flex-col gap-4 w-full md:max-w-[800px] mx-auto">
      <PreviewCard
        title={title}
        id={id}
      />
    </div>
  );
};

export default ChatPreview;

type PreviewCardProps = {
  title?: string;
  id: number;
};

const PreviewCard = ({ title, id }: PreviewCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const { setTitle } = useChatsActions();

  const handleSubmitNewTitle = () => {
    setTitle(id, currentTitle ?? "");
    setIsEditing(false);
  }

  return (
    <div className="flex gap-2 items-center justify-between w-full">
      <ChatBubbleLeftIcon className="h-5 w-5" />
      
      {isEditing ?
        <>
          <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} />
          <CheckIcon onClick={() => handleSubmitNewTitle()}/>
          <XMarkIcon onClick={() => {
            setCurrentTitle(title ?? "");
            setIsEditing(false)
          }} />
        </>  
        :
      (
        <>
          <p className="rounded">{title}</p>
          <EditChatTitleButton setIsEditing={setIsEditing} />
          <DeleteChatButton id={id} />
        </>
      )
      }

    </div>
  );
};

const DeleteChatButton = ({ id }: { id: number }) => {
  const deleteChatHistory = useDeleteChatHistory();

  const handleDelete = async () => {
    try {
      await deleteChatHistory.mutateAsync(id);
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

type EditButtonProps = {
  setIsEditing: (isEditing: boolean) => void;
}

const EditChatTitleButton = ({ setIsEditing }: EditButtonProps) => {

  return (
    <button className="btn">
      <PencilSquareIcon
        className="h-5 w-5 cursor-pointer"
        onClick={() => setIsEditing(true)}
      />
    </button>
  );
};
