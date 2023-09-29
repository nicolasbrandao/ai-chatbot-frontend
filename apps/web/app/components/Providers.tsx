"use client";

import { SessionProvider } from "next-auth/react";
import { PropsWithChildren, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { loadProcessedEmbedding } from "../services/langchain/embedding";
import { DocumentProvider } from "../hooks/useDocument";
import { ThemeProvider } from "../hooks/useTheme";

const queryClient = new QueryClient();

export default function Providers({ children }: PropsWithChildren) {
  const loadEmbedding = async () => await loadProcessedEmbedding();

  useEffect(() => {
    loadEmbedding();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider>
          <DocumentProvider>{children}</DocumentProvider>
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
