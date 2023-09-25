"use client";

import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

// Define the shape of the context
interface DocumentProps {
  open: boolean;
  page: number;
  setOpen: () => void;
  setClose: () => void;
  setPage: (page: number) => void;
}

// Create the context
const DocumentContext = createContext<DocumentProps | undefined>(undefined);

// Create the provider component
export const DocumentProvider = ({ children }: PropsWithChildren) => {
  const [open, setOpenState] = useState(false);
  const [page, setPageState] = useState(0);

  const setOpen = () => setOpenState(true);
  const setClose = () => setOpenState(false);
  const setPage = (page: number) => setPageState(page);

  return (
    <DocumentContext.Provider
      value={{ open, page, setOpen, setClose, setPage }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

// Custom hook to use the context
export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocument must be used within a DocumentProvider");
  }
  return context;
};
