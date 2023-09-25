"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ChangeEvent,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import {
  useGetChatHistory,
  useCreateChatHistory,
  useSubmitChatMessage,
  useUpdateChatHistory,
} from "@/app/hooks/useChatLocalApi";
import { Chat, Message } from "@/types/shared";
import useApiKey from "./useApiKey";
import { useParams, useRouter } from "next/navigation";

export type ChatState = {
  message: string;
  answer: string;
  isGenerating: boolean;
  isLoading: boolean;
  data: Chat | undefined;
};

export type ChatActions = {
  handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSave: (rawId: string | undefined, chatHistory: Chat) => Promise<void>;
  updateChat: (
    rawId: string | undefined,
    chatHistory: Chat,
  ) => Promise<Chat | null>;
  handleCompletion: ({
    message,
    history,
  }: {
    message: string;
    history: Message[];
  }) => Promise<void>;
};

type Reducers =
  | { type: "SET_INITIAL" }
  | { type: "SET_MESSAGE"; payload: string }
  | { type: "SET_ANSWER"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_GENERATING"; payload: boolean }
  | { type: "SET_CHAT"; payload: Chat };

const ChatStateContext = createContext<ChatState | null>(null);
const ChatActionsContext = createContext<ChatActions | null>(null);

const initialState: ChatState = {
  message: "",
  answer: "",
  isGenerating: false,
  isLoading: true,
  data: undefined,
};

const reducer = (state: typeof initialState, reducer: Reducers) => {
  switch (reducer.type) {
    case "SET_MESSAGE":
      return { ...state, message: reducer.payload };
    case "SET_ANSWER":
      return { ...state, answer: reducer.payload };
    case "SET_LOADING":
      return { ...state, isLoading: reducer.payload };
    case "SET_GENERATING":
      return { ...state, isGenerating: reducer.payload };
    case "SET_CHAT":
      return {
        ...state,
        data: { ...state.data, ...reducer.payload },
      };
    case "SET_INITIAL":
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
  const { data: fetchedChatHistory, isLoading } = useGetChatHistory(id);

  const updateChatHistory = useUpdateChatHistory();
  const { push } = useRouter();
  const createChatHistory = useCreateChatHistory();
  const submitChatMessage = useSubmitChatMessage();

  const { data: session } = useSession();
  const user_email = session?.user?.email!;

  useEffect(() => {
    dispatch({ type: "SET_INITIAL" });
    if (fetchedChatHistory) {
      dispatch({
        type: "SET_CHAT",
        payload: fetchedChatHistory,
      });
    }
  }, [fetchedChatHistory]);

  useEffect(
    () =>
      dispatch({
        type: "SET_LOADING",
        payload: isLoading,
      }),

    [isLoading],
  );

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: "SET_MESSAGE", payload: e.target.value });
  };

  const handleCompletion = async ({
    message,
    history,
  }: {
    message: string;
    history: Message[];
  }) => {
    const userMessage: Message = {
      type: "USER",
      message: message,
      createdAt: Date.now(),
    };
    dispatch({ type: "SET_GENERATING", payload: true });
    dispatch({ type: "SET_MESSAGE", payload: "" });
    const { mutateAsync: submitMessage } = submitChatMessage;
    if (!apiKey) {
      alert("Please enter an API key");
      return;
    }

    const newChatHistory: Chat = {
      ...state.data!,
      created_at: state.data?.created_at ?? Date.now(),
      user_email,
      title: state.data?.title ?? "",
      history: [...(history ?? []), userMessage],
    };

    dispatch({
      type: "SET_CHAT",
      payload: newChatHistory,
    });

    const { text, sources } = await submitMessage({
      openAIApiKey: apiKey,
      message: message,
      history: history ?? [],
      setState: (newAiResponse) => {
        dispatch({ type: "SET_ANSWER", payload: newAiResponse as string });
      },
    });

    dispatch({ type: "SET_GENERATING", payload: false });

    const newMessages: Message[] = [
      userMessage,
      {
        type: "AI",
        message: text,
        sources,
        createdAt: Date.now(),
      },
    ];

    const newChatHistoryWithGeneratedMessage: Chat = {
      ...state.data!,
      created_at: state.data?.created_at ?? Date.now(),
      user_email,
      title: state.data?.title ?? "",
      history: [...(history ?? []), ...newMessages],
    };

    dispatch({
      type: "SET_CHAT",
      payload: newChatHistoryWithGeneratedMessage,
    });

    dispatch({ type: "SET_ANSWER", payload: "" });

    await handleSave(rawId as string, newChatHistoryWithGeneratedMessage);
  };

  const createNewChat = async (chatHistory: Chat | undefined) => {
    console.log("create chat history");
    try {
      const response = await createChatHistory.mutateAsync({
        user_email,
        history: chatHistory?.history ?? [],
      });
      console.log({ response });

      return response;
    } catch (e) {
      console.log(e);
    }
  };

  const updateChat = async (rawId: string | undefined, chatHistory: Chat) => {
    console.log("update chat history");

    const response = await updateChatHistory.mutateAsync({
      updates: chatHistory,
      id: parseInt(rawId! as string),
    });
    console.log({ response });
    return response;
  };

  const handleSave = async (rawId: string | undefined, chatHistory: Chat) => {
    console.log("saving");
    console.log({ rawId, chatHistory });

    const savedChat = !rawId
      ? await createNewChat(chatHistory)
      : await updateChat(rawId, chatHistory!);
    const { id: savedId } = savedChat ?? {};

    console.log({ savedChat });

    console.log("saved");
    if (savedId !== undefined) push(`/${savedId ?? rawId}`);
  };

  return (
    <ChatStateContext.Provider value={state}>
      <ChatActionsContext.Provider
        value={{
          handleChange,
          handleSave,
          handleCompletion,
          updateChat,
        }}
      >
        {children}
      </ChatActionsContext.Provider>
    </ChatStateContext.Provider>
  );
};

export const useChatState = () => {
  const context = useContext(ChatStateContext);
  if (!context) {
    throw new Error("useChatState must be used within a ChatProvider");
  }
  return context;
};

export const useChatActions = () => {
  const context = useContext(ChatActionsContext);
  if (!context) {
    throw new Error("useChatActions must be used within a ChatProvider");
  }
  return context;
};
