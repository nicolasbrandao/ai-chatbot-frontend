import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  listChatHistories,
  getChatHistory,
  createChatHistory,
  updateChatHistory,
  deleteChatHistory,
} from "@/app/services/dexie";
import { Message, OmitChatHistoryKeys } from "@/types/models/shared";

export const useListChatHistories = () => {
  return useQuery("chatHistoriesDexie", listChatHistories);
};

export const useGetChatHistory = (id: number) => {
  return useQuery(["chatHistoryDexie", id], () => getChatHistory(id));
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
    ({ id, updates }: { id: number; updates: OmitChatHistoryKeys }) => {
      return updateChatHistory(id, {
        ...updates,
        chat_history: [
          ...((updates.chat_history as unknown as Message[][]) ?? []), //NOTE Sorry lord because i sin here
        ],
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
