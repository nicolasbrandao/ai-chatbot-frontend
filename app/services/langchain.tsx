import { Message } from "@/types/models/shared";
import { AIMessage, HumanMessage, SystemMessage } from "langchain/schema";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";

export function buildMessage(message: Message) {
  switch (message.type) {
    case "AI":
      return new AIMessage(message.message);
    case "USER":
      return new HumanMessage(message.message);
    case "SYSTEM":
      return new SystemMessage(message.message);
    default:
      throw new Error("Invalid message type");
  }
}

export function buildMessages(history?: Message[][]) {
  if (!history) return [];
  return history.map((messages) => messages.map(buildMessage));
}

export const submitChatMessage = async ({
  message,
  history,
  setState,
}: {
  message: string;
  history?: Message[][];
  setState: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const openAIApiKey = "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";
  const model = new ChatOpenAI({
    openAIApiKey,
    modelName: "gpt-4",
    streaming: true,
  });
  const historyMessages = buildMessages(history).flat();
  const memory = new BufferMemory({
    chatHistory: new ChatMessageHistory(historyMessages),
  });
  const chain = new ConversationChain({ llm: model, memory: memory });
  let aiResponse = "";
  const { response } = await chain.call(
    { input: message },
    {
      callbacks: [
        {
          handleLLMNewToken(token) {
            aiResponse += token;
            setState(aiResponse);
          },
        },
      ],
    },
  );
  return response;
};
