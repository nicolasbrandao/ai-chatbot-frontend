import { Document } from "langchain/document";

export interface Message {
  id?: number; //Should be mandatory in the future
  type: "AI" | "USER" | "SYSTEM";
  message: string;
  createdAt: number;
  sources?: Document[];
}

export interface Chat {
  id: number;
  title?: string;
  history: Message[];
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
