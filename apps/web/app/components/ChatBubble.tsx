import { Message } from "@/types/shared";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Markdown from "./Markdown";
import { dateFormatter } from "@/shared/utils";
import { ClipboardIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import Collapsible from "./Collapsble";
import { useState } from "react";
import { useChat } from "../hooks/useChat";

export default function ChatBubble({ message }: { message: Message }) {
  const session = useSession();
  const aiImage = "https://picsum.photos/id/237/200/300";
  const defaultImage = "https://picsum.photos/id/252/200/300";
  const humanImage = session?.data?.user?.image ?? defaultImage;
  const userName = session?.data?.user?.name ?? "User";
  const isAiMessage = message.type === "AI";
  const [isEditing, setIsEditing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(message.message);
  const { handleReSubmit, chat } = useChat();
  const indexOfCurrentMessage = chat.findIndex(
    (c) => c.message === message.message
  );

  const sourcesContent = message?.sources?.map((source, index) => {
    const sourceDescription = `${source.metadata?.source} page:${source.metadata?.loc?.pageNumber} from line ${source.metadata?.loc?.lines?.from} to ${source.metadata?.loc?.lines?.from}`;

    return (
      <div
        key={`${index}-${source}`}
        className="tooltip p-1"
        data-tip={sourceDescription}
      >
        <button className="btn">{index}</button>
      </div>
    );
  });

  return (
    <>
      <div className={`chat ${isAiMessage ? "chat-start" : "chat-end"}`}>
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <Image
              src={isAiMessage ? aiImage : humanImage}
              alt="AI"
              width={50}
              height={50}
            />
          </div>
        </div>
        <div className="chat-header">
          {isAiMessage ? "AI" : userName}
          <time className="text-xs opacity-50 pl-2">
            {dateFormatter(new Date(message.createdAt).toISOString())}
          </time>
        </div>
        <div
          className={`chat-bubble  text-base-content ${
            isAiMessage ? "bg-base-200" : ""
          }`}
        >
          {!isEditing ? (
            <Collapsible collapsedContent={sourcesContent}>
              <Markdown markdown={message.message} />
            </Collapsible>
          ) : (
            <div>
              <textarea
                className="textarea w-full resize-none"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
              ></textarea>
              <button
                onClick={async () => {
                  setIsEditing(false);
                  await handleReSubmit(indexOfCurrentMessage, currentMessage);
                }}
              >
                Resubmit
              </button>
            </div>
          )}
        </div>
        <div className="chat-footer opacity-50">
          <div
            className="flex gap-1 cursor-pointer"
            onClick={() => navigator.clipboard.writeText(message.message)}
          >
            <ClipboardIcon className="h-4 w-4 mt-1" />
          </div>
          <div
            className="flex gap-1 cursor-pointer"
            onClick={() => setIsEditing(!isEditing)}
          >
            <DocumentTextIcon className="h-4 w-4 mt-1" />
          </div>
        </div>
      </div>
    </>
  );
}
