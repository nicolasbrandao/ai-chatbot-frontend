"use client";

import { useMutation, useQuery, useQueryClient } from "react-query";

import axios from "axios";

import { ChatHistory, Message } from "@/types/models/shared";

export const useSubmitChatMessage = () => {
  return useMutation(
    async (data: {
      message: string;
      history?: Message[][];
      setState: React.Dispatch<React.SetStateAction<string>>;
    }) => {
      const { message, history, setState } = data;
      let aiResponse = "";

      const res = await fetch("http://localhost:3001/api2/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Transfer-Encoding": "chunked",
        },
        body: JSON.stringify({
          message,
          history,
          SystemMessage: "Act like a helpful assistant",
        }),
      });

      if (!res.ok) throw new Error("Could not send message");

      const reader = res.body?.getReader();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          aiResponse += new TextDecoder().decode(value);
          setState(aiResponse);
        }
      }
      return aiResponse;
    },
  );
};

// Chat History API
const fetchChatHistories = async (): Promise<ChatHistory[]> => {
  const { data } = await axios.get("/api2/chat-history");
  return data;
};

const fetchChatHistoryById = async (id: string): Promise<ChatHistory> => {
  const { data } = await axios.get(`/api2/chat-history/${id}`);
  return data;
};

const createChatHistory = async (
  newHistory: Partial<ChatHistory>,
): Promise<ChatHistory> => {
  const { data } = await axios.post("/api2/chat-history", newHistory);
  return data;
};

const updateChatHistory = async (
  updatedHistory: Partial<ChatHistory>,
): Promise<ChatHistory> => {
  const { id, ...body } = updatedHistory;
  const { data } = await axios.put(
    `/api2/chat-history/${updatedHistory.id}`,
    body,
  );
  return data;
};

const deleteChatHistory = async (id: string): Promise<void> => {
  await axios.delete(`/api2/chat-history/${id}`);
};

export const useChatHistories = () => {
  return useQuery("chatHistories", fetchChatHistories);
};

export const useChatHistory = (id: string) => {
  return useQuery(["chatHistory", id], () => fetchChatHistoryById(id));
};

export const useCreateChatHistory = () => {
  const queryClient = useQueryClient();
  return useMutation(createChatHistory, {
    onSuccess: () => {
      queryClient.invalidateQueries("chatHistories");
    },
  });
};

export const useUpdateChatHistory = () => {
  const queryClient = useQueryClient();
  return useMutation(updateChatHistory, {
    onSuccess: () => {
      queryClient.invalidateQueries("chatHistories");
    },
  });
};

export const useDeleteChatHistory = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteChatHistory, {
    onSuccess: () => {
      queryClient.invalidateQueries("chatHistories");
    },
  });
};
