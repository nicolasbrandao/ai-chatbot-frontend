import { Embedding, Message } from "@/types/shared";
import { AIMessage, HumanMessage, SystemMessage } from "langchain/schema";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { ConversationalRetrievalQAChain, LLMChain } from "langchain/chains";

import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import DexieVectorStore from "./DexieVectorStore";
import Dexie from "dexie";

import { TransformerjsEmbeddings } from "./TransformerjsEmbeddings";

const db = new Dexie("embeddings");
db.version(1).stores({
  embeddings: "++id, created_at",
});

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
  openAIApiKey,
  message,
  history,
  setState,
}: {
  openAIApiKey: string;
  message: string;
  history?: Message[][];
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

  const historyMessages = buildMessages(history).flat();
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
    }
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
  history: Message[][];
  openAIApiKey: string;
}) => {
  // We can construct an LLMChain from a PromptTemplate and an LLM.
  const getFirstMessage = (history: Message[][]): string => {
    const [firstMessages] = history;
    const [firstMessage] = firstMessages;
    if (!firstMessage) return "";
    return firstMessage.message;
  };

  const model = new OpenAI({ openAIApiKey, temperature: 0 });
  const prompt = PromptTemplate.fromTemplate(
    "There's the first message from the user to the chat assistant, please provide a short and meaningful title for it {message}"
  );
  const chainA = new LLMChain({ llm: model, prompt });
  const response = await chainA.call({ message: getFirstMessage(history) });
  return response?.text;
};

export const getEmbeddingsRetriever = async () => {
  const vectorStore = await new DexieVectorStore(
    new TransformerjsEmbeddings({}),
    {
      client: db.table("embeddings"),
    }
  );

  const retriever = await vectorStore.asRetriever(6);

  return retriever;
};
export const loadProcessedEmbedding = async () => {
  const response = await fetch("/bucket/embeddings.json");
  const {
    embeddings,
    createAt,
  }: { embeddings: Embedding[]; createAt: number } = await response.json();

  // Get the last_embeddings_date from local storage or some other store
  const lastEmbeddingsDate = localStorage.getItem("last_embeddings_date");

  // If there's no previous timestamp or the new one is greater, update the cache
  if (!lastEmbeddingsDate || Number(lastEmbeddingsDate) < createAt) {
    // Clear the table and add new entries

    await db.table("embeddings").clear();
    await db.table("embeddings").bulkAdd(embeddings);

    // Update the last_embeddings_date in local storage
    localStorage.setItem("last_embeddings_date", createAt.toString());
  }
};
