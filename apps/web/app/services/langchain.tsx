import { Message } from "@/types/models/shared";
import { AIMessage, HumanMessage, SystemMessage } from "langchain/schema";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { ConversationChain, LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import DexieVectorStore from "./DexieVectorStore";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import Dexie from "dexie";

import { Document } from "langchain/document";
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
    }
  );
  return response;
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
  const response = await fetch("/bible.txt");
  const fetchedTxt = await response.text();

  // Store it in docs
  const docs = [new Document({ pageContent: fetchedTxt })];
  console.log({ docs });

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 0,
  });
  const texts = await splitter.splitDocuments(docs);
  console.log({ texts });

  const vectorStore = await DexieVectorStore.fromDocuments(
    texts,
    new TransformerjsEmbeddings({}),
    {
      client: db.table("embeddings"),
    }
  );
  console.log({ vectorStore });

  const retriever = vectorStore.asRetriever();
  console.log({ retriever });

  return retriever;
};

export const getConversationalQa = async (apiKey: string) => {
  const retriever = await getEmbeddingsRetriever();

  const template = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer as concise as possible.
Always say "thanks for asking!" at the end of the answer.
{context}
Question: {question}
Helpful Answer:`;

  const QA_CHAIN_PROMPT = new PromptTemplate({
    inputVariables: ["context", "question"],
    template,
  });

  const model = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: apiKey,
  });

  const chain = new RetrievalQAChain({
    combineDocumentsChain: loadQAStuffChain(model, { prompt: QA_CHAIN_PROMPT }),
    retriever,
    verbose: true,
    returnSourceDocuments: true,
    inputKey: "question",
  });

  return chain;
};
