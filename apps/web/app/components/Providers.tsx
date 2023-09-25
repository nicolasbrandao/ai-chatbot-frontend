"use client";

import { SessionProvider } from "next-auth/react";
import { PropsWithChildren, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { loadProcessedEmbedding } from "../services/langchain/embedding";
import { ChatProvider } from "../hooks/useChat";

const queryClient = new QueryClient();

export default function Providers({ children }: PropsWithChildren) {
  const loadEmbedding = async () => await loadProcessedEmbedding();

  useEffect(() => {
    loadEmbedding();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ChatProvider>{children}</ChatProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
