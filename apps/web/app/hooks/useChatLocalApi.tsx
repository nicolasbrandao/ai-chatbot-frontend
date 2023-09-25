"use client";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  listChatHistories,
  getChatHistory,
  createChatHistory,
  updateChatHistory,
  deleteChatHistory,
  updateChats,
} from "@/app/services/dexie";
import { Chat, Message } from "@/types/shared";
import {
  submitChatMessage,
  buildTitleFromHistory,
} from "../services/langchain/messages";

export const useListChatHistories = () => {
  return useQuery("chatHistoriesDexie", listChatHistories);
};

export const useGetChatHistory = (id?: number) => {
  return useQuery(["chatHistoryDexie", id], () =>
    id ? getChatHistory(id) : undefined
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
        history: [...(updates?.history ?? [])],
        user_email: updates.user_email ?? "",
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("chatHistoriesDexie");
        queryClient.invalidateQueries("chatHistoryDexie");
      },
    }
  );
};

export const useDeleteChatHistory = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteChatHistory, {
    onSuccess: () => {
      queryClient.invalidateQueries("chatHistoriesDexie");
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
    }
  );
};

export const useUpdateChats = () => {
  const queryClient = useQueryClient();
  return useMutation(updateChats, {
    onSuccess: () => {
      queryClient.invalidateQueries("chatHistoriesDexie");
      queryClient.invalidateQueries("chatHistoryDexie");
    },
  })
}
