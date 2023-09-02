export interface Message {
  type: "AI" | "USER" | "SYSTEM";
  message: string;
  createdAt: number;
}

export interface ChatHistory {
  id: string;
  chat_history: Message[][];
  user_email: string;
}
