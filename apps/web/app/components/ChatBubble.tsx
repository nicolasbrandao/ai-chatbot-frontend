import { Message } from "@/shared/types";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Markdown from "./Markdown";
import { dateFormatter } from "@/shared/utils";
import {
  ArrowPathIcon,
  ClipboardIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import Collapsible from "./Collapsble";
import { Dispatch, SetStateAction, useState } from "react";
import { useDocument } from "../hooks/useDocument";
import {
  useChat,
  useSubmitChatMessage,
  useUpdateChat,
} from "../hooks/useChatLocalApi";
import useApiKey from "../hooks/useApiKey";
import { useParams } from "next/navigation";

export default function ChatBubble({
  message,
  setAnswer,
}: {
  message: Message;
  setAnswer: Dispatch<SetStateAction<string>>;
}) {
  const session = useSession();
  const aiImage = "https://picsum.photos/id/237/200/300";
  const defaultImage = "https://picsum.photos/id/252/200/300";
  const humanImage = session?.data?.user?.image ?? defaultImage;
  const userName = session?.data?.user?.name ?? "User";
  const isAiMessage = message.type === "AI";
  const [isEditing, setIsEditing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(message.message);
  const { mutateAsync: handleCompletion } = useSubmitChatMessage();
  const { id: rawId } = useParams();
  const id = rawId ? parseInt(rawId as string) : undefined;
  const { data: chat } = useChat(id);
  const history = chat?.history ?? [];
  const { apiKey } = useApiKey();
  const { mutateAsync: updateChatHistory } = useUpdateChat();
  const getSlicedHistory = () => {
    const messageEditedIndex = history.findIndex(
      (h) => h.message === message.message,
    );
    let slicedHistory: Message[] = history.slice(0, messageEditedIndex);
    console.log({ slicedHistory });

    return slicedHistory;
  };
  const { setOpen, setPage } = useDocument();

  const handleOpenSource = (page: number) => {
    setPage(page);
    setOpen();
  };

  const sourcesContent = message?.sources?.map((source, index) => {
    const sourceDescription = source.pageContent;
    const pageNumber = source.metadata?.loc?.pageNumber;
    return (
      <div
        key={`${index}-${source}`}
        className="tooltip p-1"
        data-tip={sourceDescription}
      >
        <button className="btn" onClick={() => handleOpenSource(pageNumber)}>
          {index}
        </button>
      </div>
    );
  });

  const handleEdition = async () => {
    const slicedHistory = getSlicedHistory();
    setIsEditing(false);
    const messageEdited: Message = {
      createdAt: Date.now(),
      message: currentMessage,
      type: "USER",
    };
    const slicedHistoryWithEditedMessage = [...slicedHistory, messageEdited];
    updateChatHistory({
      id: id!,
      updates: { history: slicedHistoryWithEditedMessage },
    });
    const answer = await handleCompletion({
      openAIApiKey: apiKey!,
      setState: setAnswer,
      message: currentMessage,
      history: getSlicedHistory(),
    });
    const aiAnswerMessage: Message = {
      createdAt: Date.now(),
      message: answer.text,
      sources: answer.sources,
      type: "AI",
    };
    const editedHistoryWithAnswer = [
      ...slicedHistoryWithEditedMessage,
      aiAnswerMessage,
    ];

    updateChatHistory({
      id: id!,
      updates: { history: editedHistoryWithAnswer },
    });
    setCurrentMessage("");
    setAnswer("");
  };

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
              {!isAiMessage && (
                <button onClick={handleEdition}>
                  <ArrowPathIcon className="h-[15px] w-[15px]" />
                </button>
              )}
            </div>
          )}
        </div>
        <div className="chat-footer opacity-50 flex">
          <div
            className="flex gap-1 cursor-pointer"
            onClick={() => navigator.clipboard.writeText(message.message)}
          >
            <ClipboardIcon className="h-4 w-4 mt-1" />
          </div>
          {!isAiMessage && (
            <div
              className="flex gap-1 cursor-pointer"
              onClick={() => setIsEditing(!isEditing)}
            >
              <PencilSquareIcon className="h-4 w-4 mt-1" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
