import React, { useEffect, useState } from "react";
import {
  ChatBubbleLeftIcon,
  TrashIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  useDeleteChat,
  useChat,
  useUpdateChat,
} from "../hooks/useChatLocalApi";

interface SimpleChatProps {
  id: number;
}

const ChatPreview: React.FC<SimpleChatProps> = ({ id }: SimpleChatProps) => {
  const { data: chat } = useChat(id);
  const { title } = chat ?? {};
  return (
    <div className="flex flex-col gap-4 w-full md:max-w-[800px] mx-auto px-2">
      <PreviewCard title={title} id={id} />
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
  const { mutateAsync: updateChat } = useUpdateChat();

  const handleSubmitNewTitle = async () => {
    await updateChat({ id, updates: { title: currentTitle } });
    setIsEditing(false);
  };

  useEffect(() => {
    setCurrentTitle(title ?? "");
  }, [title]);

  return (
    <div className="flex gap-2 items-center justify-between w-full">
      <button className="btn">
        <ChatBubbleLeftIcon className="h-4 w-4" />
      </button>
      {isEditing ? (
        <>
          <input
            type="text"
            placeholder="Type here"
            className="input w-[85px] max-w-xs px-1"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
          />
          <SubmitTitleButton
            handleSubmitNewTitle={handleSubmitNewTitle}
            title={title}
          />
          <CancelTitleEditButton
            setCurrentTitle={setCurrentTitle}
            setIsEditing={setIsEditing}
            title={title}
          />
        </>
      ) : (
        <>
          <div className="tooltip" data-tip={title}>
            <p className="rounded w-[85px] truncate">{title}</p>
          </div>
          <EditChatTitleButton setIsEditing={setIsEditing} />
          <DeleteChatButton id={id} />
        </>
      )}
    </div>
  );
};

type SubmitTitleButtonProps = {
  title: string | undefined;
  handleSubmitNewTitle: (title: string) => void;
};

const SubmitTitleButton = ({
  handleSubmitNewTitle,
  title,
}: SubmitTitleButtonProps) => {
  return (
    <button className="btn">
      <CheckIcon
        className="h-4 w-4 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          handleSubmitNewTitle(title ?? "");
        }}
      />
    </button>
  );
};

type CancelTitleEditButtonProps = {
  title: string | undefined;
  setCurrentTitle: React.Dispatch<React.SetStateAction<string | undefined>>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

const CancelTitleEditButton = ({
  setCurrentTitle,
  setIsEditing,
  title,
}: CancelTitleEditButtonProps) => {
  return (
    <button className="btn">
      <XMarkIcon
        className="h-4 w-4 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setCurrentTitle(title ?? "");
          setIsEditing(false);
        }}
      />
    </button>
  );
};

const DeleteChatButton = ({ id }: { id: number }) => {
  const deleteChatHistory = useDeleteChat();

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
        className="h-4 w-4 cursor-pointer"
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
};

const EditChatTitleButton = ({ setIsEditing }: EditButtonProps) => {
  return (
    <button className="btn">
      <PencilSquareIcon
        className="h-4 w-4 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
      />
    </button>
  );
};
