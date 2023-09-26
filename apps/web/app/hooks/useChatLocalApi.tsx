"use client";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  listChatHistories,
  getChatHistory,
  createChatHistory,
  updateChatHistory,
  deleteChatHistory,
} from "@/app/services/dexie";
import { Chat, Message } from "@/types/shared";
import {
  submitChatMessage,
  buildTitleFromHistory,
} from "../services/langchain/messages";
import { useSession } from "next-auth/react";

export const useListChatHistories = () => {
  return useQuery("chatHistoriesDexie", listChatHistories);
};

export const useGetChatHistory = (id?: number) => {
  const { data } = useSession();
  return useQuery(["chatHistoryDexie", id], () =>
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

export const useCreateChatHistory = () => {
  const queryClient = useQueryClient();
  return useMutation(createChatHistory, {
    onSuccess: () => {
      queryClient.invalidateQueries("chatHistoriesDexie");
    },
  });
};

export const useUpdateChatHistory = () => {
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
        queryClient.invalidateQueries("chatHistoriesDexie");
        queryClient.invalidateQueries("chatHistoryDexie");
      },
    },
  );
};

export const useDeleteChatHistory = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteChatHistory, {
    onSuccess: () => {
      queryClient.invalidateQueries("chatHistoriesDexie");
      queryClient.invalidateQueries("chatHistoryDexie");
    },
  });
};

export const useSubmitChatMessage = () => {
  return useMutation(submitChatMessage);
};

export const useBuildTitleFromHistory = () => {
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
