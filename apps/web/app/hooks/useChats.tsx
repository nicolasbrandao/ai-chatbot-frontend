"use client"

import { Chat } from '@/types/shared';
import { PropsWithChildren, ReactNode, createContext, useContext, useEffect, useReducer } from 'react';
import { useListChatHistories, useUpdateChats } from './useChatLocalApi';

// Define the ChatState type
type ChatsState = {
  chats: Chat[];
};

// Define the Action type
type Action =
  | { type: 'ADD_CHAT'; payload: Chat }
  | { type: 'UPDATE_CHAT'; payload: Chat }
  | { type: 'DELETE_CHAT'; payload: number }
  | { type: 'SET_CHATS'; payload: Chat[] };

type ChatsActions = {
  setTitle: (id: number, title: string) => void;
}

// Create contexts
const ChatsStateContext = createContext<ChatsState | undefined>(undefined);
const ChatsActionContext = createContext<ChatsActions | undefined>(undefined);

// Reducer function for CRUD operations
const chatReducer = (state: ChatsState, action: Action): ChatsState => {
  switch (action.type) {
    case 'ADD_CHAT':
      return { chats: [...state.chats, action.payload] };
    case 'UPDATE_CHAT':
      return {
        chats: state.chats.map((chat) =>
          chat.id === action.payload.id ? action.payload : chat
        ),
      };
    case 'DELETE_CHAT':
      return {
        chats: state.chats.filter((chat) => chat.id !== action.payload),
      };
    case 'SET_CHATS':
      return {
        chats: action.payload
      }
    default:
      return state;
  }
};

type ChatsProviderProps = {
  chats: Chat[]
  children: ReactNode
}

// Create a provider component
export const ChatsProvider = ({ chats, children }: ChatsProviderProps) => {
  const [state, dispatch] = useReducer(chatReducer, { chats });
  const setChats = (chats: Chat[]) => {
    return dispatch({ type: "SET_CHATS", payload:chats });
  }

  const setTitle = (id: number, title: string) => {
    const chatIndex = state.chats.findIndex((chat) => chat.id === id)
    const chat = state.chats[chatIndex];

    const updatedChats: Chat[] = state.chats.splice(chatIndex, 1).concat({ ...chat, title })
    return setChats(updatedChats);
  }  

  const refreshChats = async () => {
    await updateChats.mutateAsync(state.chats)
  }

  const updateChats = useUpdateChats();

  useEffect(() => {
    refreshChats();
  },[state])

  useEffect(() => {
    if (chats) {
      setChats(chats);
    }
  }, [chats])
  
  return (
    <ChatsStateContext.Provider value={state}>
      <ChatsActionContext.Provider value={{setTitle}}>
        {children}
      </ChatsActionContext.Provider>
    </ChatsStateContext.Provider>
  );
};

// Custom hooks to use state and dispatch
export const useChatsState = () => {
  const context = useContext(ChatsStateContext);
  if (!context) {
    throw new Error('useChatState must be used within a ChatProvider');
  }
  return context;
};

export const useChatsActions = () => {
  const context = useContext(ChatsActionContext);
  if (!context) {
    throw new Error('useChatDispatch must be used within a ChatProvider');
  }
  return context;
};