"use client";

import { SessionProvider } from "next-auth/react";
import { PropsWithChildren, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { loadProcessedEmbedding } from "../services/langchain/embedding";
import { ChatProvider } from "../hooks/useChat";
import { DocumentProvider } from "../hooks/useDocument";
import { ChatsProvider } from "../hooks/useChats";
import Dexie from "dexie";
import { Chat } from "@/types/shared";

const queryClient = new QueryClient();

export default function Providers({ children }: PropsWithChildren) {
  const [chats, setChats] = useState<Chat[] | undefined>(undefined);
  const loadEmbedding = async () => await loadProcessedEmbedding();
  const db = new Dexie("chatHistoryDB");
  db.version(1).stores({
    chat_history: "++id, created_at",
  });
  
  
  async function listChatHistories(): Promise<void> {
    return setChats(await db.table("chat_history").toArray());
  }

  useEffect(() => {
    loadEmbedding();
    listChatHistories();
  }, []);

  if (!chats) {
    return "Loading..."
  }

  console.log("XXXXXXXXXXXXXXXXXXXXX", {chats})

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ChatsProvider chats={chats}>
          <ChatProvider>
            <DocumentProvider>{children}</DocumentProvider>
          </ChatProvider>
        </ChatsProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
