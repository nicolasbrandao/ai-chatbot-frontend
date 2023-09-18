import { useState, useEffect } from "react";

const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const updateApiKey = (newKey: string) => {
    localStorage.setItem("apiKey", newKey);
    setApiKey(newKey);
  };

  const deleteApiKey = () => {
    localStorage.removeItem("apiKey");
    setApiKey(null);
  };

  return {
    apiKey,
    updateApiKey,
    deleteApiKey,
  };
};

export default useApiKey;
