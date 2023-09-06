import { Message } from "@/types/models/shared";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Markdown from "./Markdown";
import { dateFormatter } from "@/shared/utils";

export default function ChatBubble({ message }: { message: Message }) {
  const session = useSession();
  const aiImage = "https://picsum.photos/id/237/200/300";
  const defaultImage = "https://picsum.photos/id/252/200/300";
  const humanImage = session?.data?.user?.image ?? defaultImage;
  const userName = session?.data?.user?.name ?? "User";
  const isAiMessage = message.type === "AI";
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
        <div className="chat-bubble">
          <Markdown markdown={message.message} />
        </div>
        <div className="chat-footer opacity-50">Message Status</div>
      </div>
    </>
  );
}
