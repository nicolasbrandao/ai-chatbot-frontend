"use client";

import { useEffect, useReducer, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";
import {
  useGetChatHistory,
  useCreateChatHistory,
  useSubmitChatMessage,
  useUpdateChatHistory,
} from "@/app/hooks/useChatLocalApi";
import { useRouter } from "next/navigation";
import { ChatHistory, Message } from "@/types/models/shared";

type ChatState = {
  message: string;
  answer: string;
  chat: Message[];
  isNewMessageLoading: boolean;
  isChatHistoryLoading: boolean;
  chatHistory: ChatHistory | undefined;
};

type ChatAction =
  | { type: "SET_MESSAGE"; payload: string }
  | { type: "SET_ANSWER"; payload: string }
  | { type: "SET_CHAT"; payload: Message[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CHAT_HISTORY"; payload: ChatHistory };

const initialState: ChatState = {
  message: "",
  answer: "",
  chat: [],
  isNewMessageLoading: false,
  isChatHistoryLoading: true,
  chatHistory: undefined,
};

const reducer = (state: typeof initialState, action: ChatAction) => {
  switch (action.type) {
    case "SET_MESSAGE":
      return { ...state, message: action.payload };
    case "SET_ANSWER":
      return { ...state, answer: action.payload };
    case "SET_CHAT":
      return { ...state, chat: action.payload };
    case "SET_LOADING":
      return { ...state, isNewMessageLoading: action.payload };
    case "SET_CHAT_HISTORY":
      return { ...state, chatHistory: action.payload };
    default:
      return state;
  }
};

export const useChat = (id?: number) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { data: fetchedChatHistory, isLoading: isChatHistoryLoading } =
    useGetChatHistory(id ?? undefined);
  const updateChatHistory = useUpdateChatHistory();
  const { push } = useRouter();
  const createChatHistory = useCreateChatHistory();
  const submitChatMessage = useSubmitChatMessage();

  const { data: session } = useSession();
  const user_email = session?.user?.email ?? "lgpelin92@gmail.com";

  useEffect(() => {
    if (fetchedChatHistory) {
      dispatch({
        type: "SET_CHAT_HISTORY",
        payload: fetchedChatHistory,
      });
    }
  }, [fetchedChatHistory]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 500);

    if (state.chatHistory) {
      dispatch({
        type: "SET_CHAT",
        payload: state.chatHistory?.chat_history?.flat() ?? [],
      });
    }

    return () => clearTimeout(debounce);
  }, [state.chatHistory]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: "SET_MESSAGE", payload: e.target.value });
  };

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    dispatch({ type: "SET_LOADING", payload: true });
    e?.preventDefault();
    const { mutateAsync: submitMessage } = submitChatMessage;
    const aiResponse = await submitMessage({
      message: state.message,
      history: state.chatHistory?.chat_history,
      setState: (newAiResponse) => {
        console.log({ newAiResponse });
        dispatch({ type: "SET_ANSWER", payload: newAiResponse as string });
      },
    });

    dispatch({ type: "SET_LOADING", payload: false });
    console.log({ aiResponse });

    const newMessages: Message[] = [
      {
        type: "USER",
        message: state.message,
        createdAt: Date.now(),
      },
      {
        type: "AI",
        message: aiResponse,
        createdAt: Date.now(),
      },
    ];

    dispatch({
      type: "SET_CHAT_HISTORY",
      payload: {
        ...state.chatHistory!,
        chat_history: [...(state.chatHistory?.chat_history ?? []), newMessages],
      },
    });
    dispatch({ type: "SET_ANSWER", payload: "" });
  };

  const createNewChat = async () =>
    createChatHistory.mutateAsync({
      user_email,
      chat_history: state.chatHistory?.chat_history ?? [],
    });

  const updateChat = async () =>
    updateChatHistory.mutateAsync({
      updates: state.chatHistory!,
      id: id!,
    });

  const handleSave = async () => {
    const savedChat = !id ? await createNewChat() : await updateChat();
    const { id: savedId } = savedChat!;
    push(`/chat/${id ?? savedId}`);
    console.log({ savedId });
  };

  return {
    answer: state.answer,
    message: state.message,
    isNewMessageLoading: state.isNewMessageLoading,
    chat: state.chat,
    handleSave,
    handleSubmit,
    handleChange,
    isChatHistoryLoading,
    chatHistory: state.chatHistory,
  };
};
