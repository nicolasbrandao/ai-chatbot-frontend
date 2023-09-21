import { Document } from "langchain/document";

export interface Message {
  type: "AI" | "USER" | "SYSTEM";
  message: string;
  createdAt: number;
  sources?: Document[];
}

export interface ChatHistory {
  id: number;
  title?: string;
  chat_history: Message[][];
  user_email: string;
  created_at: number;
}

export interface EmbeddingWorkerMessage {
  data: {
    status: "complete" | "error";
    output?: number[];
    message?: string | Error;
  };
}

export interface Embedding {
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}
