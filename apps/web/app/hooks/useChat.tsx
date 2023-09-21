"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ChangeEvent,
  FormEvent,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import {
  useGetChatHistory,
  useCreateChatHistory,
  useSubmitChatMessage,
  useUpdateChatHistory,
} from "@/app/hooks/useChatLocalApi";
import { ChatHistory, Message } from "@/types/shared";
import useApiKey from "./useApiKey";
import { useParams, useRouter } from "next/navigation";

type ChatState = {
  id: number | undefined;
  message: string;
  answer: string;
  chat: Message[];
  isNewMessageLoading: boolean;
  isChatHistoryLoading: boolean;
  chatHistory: ChatHistory | undefined;
};

type ChatContextType = {
  state: ChatState;
  chat: Message[];
  chatHistory: ChatHistory | undefined;
  dispatch: React.Dispatch<ChatAction>;
  message: string;
  answer: string;
  isNewMessageLoading: boolean;
  isChatHistoryLoading: boolean;
  handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSave: (
    rawId: string | undefined,
    chatHistory: ChatHistory
  ) => Promise<void>;
  updateChat: (
    rawId: string | undefined,
    chatHistory: ChatHistory
  ) => Promise<ChatHistory | null>;
  handleSubmit: (e?: FormEvent<HTMLFormElement>) => Promise<void>;
  handleReSubmit: (index: number, newMessage: string) => Promise<void>;
};

type ChatAction =
  | { type: "RESET" }
  | { type: "SET_MESSAGE"; payload: string }
  | { type: "SET_ANSWER"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CHAT_HISTORY"; payload: ChatHistory };

const ChatContext = createContext<ChatContextType | null>(null);

const initialState: ChatState = {
  id: undefined,
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

    case "SET_LOADING":
      return { ...state, isNewMessageLoading: action.payload };
    case "SET_CHAT_HISTORY":
      return {
        ...state,
        chatHistory: { ...state.chatHistory, ...action.payload },
        chat: action.payload.chat_history.flat(),
      };
    case "RESET":
      return initialState;

    default:
      return state;
  }
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { id: rawId } = useParams();
  const id = rawId ? parseInt(rawId as string) : undefined;

  const [state, dispatch] = useReducer(reducer, initialState);
  const { apiKey } = useApiKey();
  const { data: fetchedChatHistory, isLoading: isChatHistoryLoading } =
    useGetChatHistory(id);

  const updateChatHistory = useUpdateChatHistory();
  const { push } = useRouter();
  const createChatHistory = useCreateChatHistory();
  const submitChatMessage = useSubmitChatMessage();

  const { data: session } = useSession();
  const user_email = session?.user?.email!;

  useEffect(() => {
    dispatch({ type: "RESET" });
    if (fetchedChatHistory) {
      dispatch({
        type: "SET_CHAT_HISTORY",
        payload: fetchedChatHistory,
      });
    }
  }, [fetchedChatHistory]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: "SET_MESSAGE", payload: e.target.value });
  };

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    dispatch({ type: "SET_LOADING", payload: true });
    e?.preventDefault();
    const { mutateAsync: submitMessage } = submitChatMessage;
    if (!apiKey) {
      alert("Please enter an API key");
      return;
    }
    const { text, sources } = await submitMessage({
      openAIApiKey: apiKey,
      message: state.message,
      history: state.chatHistory?.chat_history,
      setState: (newAiResponse) => {
        dispatch({ type: "SET_ANSWER", payload: newAiResponse as string });
      },
    });

    dispatch({ type: "SET_LOADING", payload: false });

    const newMessages: Message[] = [
      {
        type: "USER",
        message: state.message,
        createdAt: Date.now(),
      },
      {
        type: "AI",
        message: text,
        sources,
        createdAt: Date.now(),
      },
    ];

    const newChatHistory: ChatHistory = {
      ...state.chatHistory!,
      created_at: state.chatHistory?.created_at ?? Date.now(),
      user_email,
      title: state.chatHistory?.title ?? "",
      chat_history: [...(state.chatHistory?.chat_history ?? []), newMessages],
    };

    dispatch({
      type: "SET_CHAT_HISTORY",
      payload: newChatHistory,
    });

    dispatch({ type: "SET_ANSWER", payload: "" });

    await handleSave(rawId as string, newChatHistory);
  };

  const handleReSubmit = async (index: number, newMessage: string) => {
    dispatch({ type: "SET_LOADING", payload: true });

    const slicedChatHistory = state.chatHistory?.chat_history.slice(
      0,
      index / 2
    );

    dispatch({
      type: "SET_CHAT_HISTORY",
      payload: {
        ...state.chatHistory!,
        chat_history: [
          ...(slicedChatHistory ?? []),
          [{ type: "USER", message: newMessage, createdAt: Date.now() }],
        ],
      },
    });

    const { text, sources } = await submitChatMessage.mutateAsync({
      openAIApiKey: apiKey!,
      message: newMessage,
      history: slicedChatHistory,
      setState: (newAiResponse) => {
        dispatch({ type: "SET_ANSWER", payload: newAiResponse as string });
      },
    });

    // Create new messages array with the new user message and AI response
    const newMessages: Message[] = [
      {
        type: "USER",
        message: newMessage,
        createdAt: Date.now(),
      },
      {
        type: "AI",
        message: text,
        sources,
        createdAt: Date.now(),
      },
    ];

    console.log({ newMessages });

    // Update the chat history
    dispatch({
      type: "SET_CHAT_HISTORY",
      payload: {
        ...state.chatHistory!,
        chat_history: [...(slicedChatHistory ?? []), newMessages],
      },
    });

    const newChatHistory: ChatHistory = {
      ...state.chatHistory!,
      chat_history: [...(slicedChatHistory ?? []), newMessages],
    };

    dispatch({ type: "SET_LOADING", payload: false });

    await handleSave(rawId as string, newChatHistory);
  };

  const createNewChat = async (chatHistory: ChatHistory | undefined) => {
    console.log("create chat history");
    try {
      const response = await createChatHistory.mutateAsync({
        user_email,
        chat_history: chatHistory?.chat_history ?? [],
      });
      console.log({ response });

      return response;
    } catch (e) {
      console.log(e);
    }
  };

  const updateChat = async (
    rawId: string | undefined,
    chatHistory: ChatHistory
  ) => {
    console.log("update chat history");

    const response = await updateChatHistory.mutateAsync({
      updates: chatHistory,
      id: parseInt(rawId! as string),
    });
    console.log({ response });
    return response;
  };

  const handleSave = async (
    rawId: string | undefined,
    chatHistory: ChatHistory
  ) => {
    console.log("saving");
    console.log({ rawId, chatHistory });

    const savedChat = !rawId
      ? await createNewChat(chatHistory)
      : await updateChat(rawId, chatHistory!);
    const { id: savedId } = savedChat ?? {};

    console.log({ savedChat });

    console.log("saved");
    if (savedId !== undefined) push(`/chat/${savedId ?? rawId}`);
  };

  return (
    <ChatContext.Provider
      value={{
        chat: state.chat,
        chatHistory: state.chatHistory,
        state,
        dispatch,
        handleChange,
        handleSave,
        updateChat,
        handleSubmit,
        handleReSubmit,
        answer: state.answer,
        isChatHistoryLoading,
        isNewMessageLoading: state.isNewMessageLoading,
        message: state.message,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  1;
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
