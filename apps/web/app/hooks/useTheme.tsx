"use client";

import {
  Dispatch,
  PropsWithChildren,
  createContext,
  useContext,
  useReducer,
} from "react";
import { Theme } from "react-toastify";

const updateTheme = "UPDATE_THEME";

const initialState = {
  theme: "dark" as Theme,
};

type StateType = typeof initialState;

type ActionType<T> = {
  type: string;
  payload: T;
};

export const reducer = (state: StateType, action: ActionType<Theme>) => {
  switch (action.type) {
    case updateTheme:
      return {
        ...state,
        theme: action.payload,
      };
    default:
      return state;
  }
};

export const ThemeContext = createContext(initialState);

type ThemeDispatchContextType = Dispatch<ActionType<Theme>>;
export const ThemeDispatchContext = createContext<ThemeDispatchContextType>(
  () => {},
);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, dispatch] = useReducer(reducer, initialState);

  return (
    <ThemeContext.Provider value={theme}>
      <ThemeDispatchContext.Provider value={dispatch}>
        {children}
      </ThemeDispatchContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const { theme } = useContext(ThemeContext);
  const dispatch = useContext(ThemeDispatchContext);
  return { theme, dispatch };
}
