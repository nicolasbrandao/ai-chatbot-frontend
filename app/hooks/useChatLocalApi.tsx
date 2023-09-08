"use client";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  listChatHistories,
  getChatHistory,
  createChatHistory,
  updateChatHistory,
  deleteChatHistory,
} from "@/app/services/dexie";
import { OmitChatHistoryKeys } from "@/types/models/shared";
import { submitChatMessage } from "../services/langchain";

export const useListChatHistories = () => {
  return useQuery("chatHistoriesDexie", listChatHistories);
};

export const useGetChatHistory = (id?: number) => {
  return useQuery(["chatHistoryDexie", id], () =>
    id ? getChatHistory(id) : undefined,
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
    ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<OmitChatHistoryKeys>;
    }) => {
      return updateChatHistory(id, {
        ...updates,
        chat_history: [...(updates?.chat_history ?? [])],
        user_email: updates.user_email ?? "lgpelin92@gmail.com",
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("chatHistoriesDexie");
      },
    },
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
