"use client";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  listChatHistories,
  getChatHistory,
  createChatHistory,
  updateChatHistory,
  deleteChatHistory,
} from "@/app/services/dexie";
import { Chat, Message } from "@/shared/types";
import {
  submitChatMessage,
  buildTitleFromHistory,
} from "../services/langchain/messages";
import { useSession } from "next-auth/react";

export const useChats = () => {
  return useQuery("chatsDexie", listChatHistories);
};

export const useChat = (id?: number) => {
  const { data } = useSession();
  return useQuery(["chatDexie", id], () =>
    id
      ? getChatHistory(id)
      : Promise.resolve<Chat>({
          created_at: Date.now(),
          id: undefined,
          history: [],
          user_email: data?.user?.email ?? "",
        }),
  );
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();
  return useMutation(createChatHistory, {
    onSuccess: () => {
      queryClient.invalidateQueries("chatsDexie");
    },
  });
};

export const useUpdateChat = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, updates }: { id: number; updates: Partial<Chat> }) => {
      return updateChatHistory(id, {
        ...updates,
        user_email: updates.user_email ?? "",
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("chatsDexie");
        queryClient.invalidateQueries("chatDexie");
      },
    },
  );
};

export const useDeleteChat = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteChatHistory, {
    onSuccess: () => {
      queryClient.invalidateQueries("chatsDexie");
      queryClient.invalidateQueries("chatDexie");
    },
  });
};

export const useSubmitChatMessage = () => {
  return useMutation(submitChatMessage);
};

export const useTitleFromHistory = () => {
  return useMutation(
    async ({
      history,
      openAIApiKey,
    }: {
      history: Message[];
      openAIApiKey: string;
    }) => {
      return await buildTitleFromHistory({ history, openAIApiKey });
    },
  );
};
