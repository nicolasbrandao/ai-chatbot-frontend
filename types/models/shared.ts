interface Message {
  id: string;
  type: "AI" | "USER" | "SYSTEM";
  message: string;
  createdAt: string;
}

interface ChatHistory {
  id: string;
  chat_history: Message[][];
  user_email: string;
}
