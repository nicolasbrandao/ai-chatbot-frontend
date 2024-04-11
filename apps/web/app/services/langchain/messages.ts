import { Message } from "@/shared/types";
import { AIMessage, HumanMessage, SystemMessage } from "langchain/schema";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { ConversationalRetrievalQAChain, LLMChain } from "langchain/chains";

import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { getEmbeddingsRetriever } from "./embedding";

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

export function buildMessages(history?: Message[]) {
  if (!history) return [];
  return history.map(buildMessage);
}

export const submitChatMessage = async ({
  openAIApiKey,
  message,
  history,
  setState,
}: {
  openAIApiKey: string;
  message: string;
  history?: Message[];
  setState: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const retriever = await getEmbeddingsRetriever();

  const streamingModel = new ChatOpenAI({
    openAIApiKey,
    modelName: "gpt-4",
    streaming: true,
    callbacks: [
      {
        handleLLMNewToken(token) {
          aiResponse += token;
          setState(aiResponse);
        },
      },
    ],
  });

  const historyMessages = buildMessages(history);
  const memory = new BufferMemory({
    memoryKey: "chat_history",
    inputKey: "question",
    outputKey: "text",
    returnMessages: true,
    chatHistory: new ChatMessageHistory(historyMessages),
  });
  const chain = ConversationalRetrievalQAChain.fromLLM(
    streamingModel,
    retriever,
    {
      memory,
      verbose: true,
      returnSourceDocuments: true,
    },
  );

  let aiResponse = "";
  const chainResponse = await chain.call({ question: message }, {});

  const { text, sourceDocuments } = chainResponse;

  return { text, sources: sourceDocuments };
};

export const buildTitleFromHistory = async ({
  history,
  openAIApiKey,
}: {
  history: Message[];
  openAIApiKey: string;
}): Promise<string> => {
  // We can construct an LLMChain from a PromptTemplate and an LLM.
  const getFirstMessage = (history: Message[]): string => {
    const [firstMessage] = history;
    if (!firstMessage) return "";
    return firstMessage.message;
  };

  const model = new OpenAI({
    openAIApiKey,
    temperature: 0,
    modelName: "gpt-3.5-turbo-instruct",
  });
  const prompt = PromptTemplate.fromTemplate(
    "There's the first message from the user to the chat assistant, please provide a short and meaningful title for it {message}. Do not include prefixes like 'Title: '.",
  );
  const chainA = new LLMChain({ llm: model, prompt });
  const response = await chainA.call({ message: getFirstMessage(history) });
  return response?.text.trim().replace(/^"|"$/g, "");
};
