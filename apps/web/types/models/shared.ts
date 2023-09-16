import { Database } from "../../types/database/supabase-generated.types";

export type ChatHistoryTable = Database["public"]["Tables"]["chat_history"];
export type ChatHistoryRow = ChatHistoryTable["Row"];
export type OmitChatHistoryKeys = Omit<
  ChatHistoryRow,
  "id" | "created_at" | "title"
>;
export interface Message {
  type: "AI" | "USER" | "SYSTEM";
  message: string;
  createdAt: number;
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
