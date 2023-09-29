"use client";

import ChatBubble from "./ChatBubble";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import TextareaAutosize from "react-textarea-autosize";
import Modal from "./Modal";
import PDFViewer from "./PDFViewer";
import { useDocument } from "@/app/hooks/useDocument";
import { useParams } from "next/navigation";
import {
  useTitleFromHistory,
  useCreateChat,
  useChat,
  useSubmitChatMessage,
  useUpdateChat,
} from "../hooks/useChatLocalApi";
import { useState } from "react";
import useApiKey from "../hooks/useApiKey";
import { Message } from "@/shared/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTheme } from "../hooks/useTheme";

const Chat: React.FC = () => {
  const { id: rawId } = useParams();
  const id = rawId ? parseInt(rawId as string) : undefined;
  const { data } = useSession();
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const { push } = useRouter();
  const { data: chat, isLoading } = useChat(id);
  console.log({ chat, isLoading });
  const { mutateAsync: updateChatHistory } = useUpdateChat();
  const { mutateAsync: createChatHistory } = useCreateChat();
  const { theme } = useTheme();

  const { apiKey } = useApiKey();
  const history: Message[] = chat?.history ?? [];
  const { mutateAsync: submitChatMessage, isLoading: isGenerating } =
    useSubmitChatMessage();
  const { mutateAsync: builTitle } = useTitleFromHistory();
  const handleCompletion = async ({}) => {
    if (!apiKey) return toast.error("Please enter an API key", { theme });
    setMessage("");
    const humanMessage: Message = {
      type: "USER",
      message,
      createdAt: Date.now(),
    };
    const historyWithQuestion = [...history, humanMessage];
    let savedId: number;
    if (id !== undefined) {
      savedId = id;
      updateChatHistory({ id: id!, updates: { history: historyWithQuestion } });
    } else {
      const title = await builTitle({
        history: historyWithQuestion,
        openAIApiKey: apiKey,
      });

      const newChat = await createChatHistory({
        title,
        user_email: data?.user?.email ?? "",
        history: historyWithQuestion,
      });
      const createdId = newChat!.id!;
      savedId = createdId;
    }

    const answerResponse = await submitChatMessage({
      message,
      history,
      openAIApiKey: apiKey,
      setState: setAnswer,
    });

    const aiMessage: Message = {
      createdAt: Date.now(),
      type: "AI",
      message: answerResponse.text,
      sources: answerResponse.sources,
    };

    const historyWithAnswer = [...historyWithQuestion, aiMessage];

    await updateChatHistory({
      id: (savedId ?? id)!,
      updates: { history: [...historyWithAnswer] },
    });
    setAnswer("");
    if (!id) push(`/${savedId}`);
  };

  const { open, setClose } = useDocument();
  if (isLoading) return <div className="loading loading-lg mx-auto" />;

  return (
    <>
      <section className="flex flex-col w-full h-full md:min-w-[300px] p-1">
        <div className="flex flex-col gap-4 w-full md:max-w-[800px] mx-auto">
          <div className="min-h-full mb-[70px]">
            {history
              .filter((message) => message.type !== "SYSTEM")
              .map((message, index) => {
                return (
                  <ChatBubble
                    setAnswer={setAnswer}
                    message={message}
                    key={`${index}`}
                  />
                );
              })}
            {answer && answer !== "" && (
              <ChatBubble
                setAnswer={setAnswer}
                message={{
                  type: "AI",
                  message: answer,
                  createdAt: Date.now(),
                }}
              />
            )}
          </div>
          <div className="flex gap-4 bg-base-300 fixed bottom-0 left-0 w-full py-2">
            <div className="md:w-[310px]" />
            <form
              className="flex flex-start bg-base-300 gap-4 p-1 rounded-xl w-fit mx-auto md:flex-1 md:pr-4"
              onSubmit={async (e) => {
                e.preventDefault();
                console.log("submitting");
                await handleCompletion({ message, history });
              }}
            >
              <TextareaAutosize
                className="textarea w-full resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyUp={async (e) => {
                  e.preventDefault();
                  if (e.key === "Enter" && !e.shiftKey) {
                    return await handleCompletion({ message, history });
                  }
                }}
                placeholder="Write your message here..."
                minRows={1}
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
                    <span className="loading loading-spinner" />
                  ) : (
                    <PaperAirplaneIcon className="h-6 w-6 " />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      <Modal isOpen={open} setClose={setClose}>
        <PDFViewer url="/bucket/bible.pdf" />
      </Modal>
    </>
  );
};

export default Chat;
