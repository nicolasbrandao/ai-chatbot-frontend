"use client";

import { useMutation, useQuery, useQueryClient } from "react-query";

import axios from "axios";

import { ChatHistory, Message } from "@/types/models/shared";

// Chat API
const postChatMessage = async (data: {
  message: string;
  systemMessage?: string;
  history?: Message[][];
  setState: React.Dispatch<React.SetStateAction<string>>;
}): Promise<void> => {
  const { message, systemMessage, history, setState } = data;

  const res = await fetch("/api2/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Transfer-Encoding": "chunked",
    },
    body: JSON.stringify({ message, systemMessage, history }),
  });

  if (!res.ok) throw new Error("Could not send message");

  const reader = res.body?.getReader();
  if (reader) {
    let aiResponse = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      console.log({ aiResponse });
      aiResponse += new TextDecoder().decode(value);

      setState(aiResponse);
    }
  }
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

export const usePostChatMessage = () => {
  return useMutation(
    (data: {
      message: string;
      systemMessage?: string;
      history?: Message[][];
      setState: React.Dispatch<React.SetStateAction<string>>;
    }) => postChatMessage(data),
  );
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
