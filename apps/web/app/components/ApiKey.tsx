import React, { ChangeEvent, useEffect, useState } from "react";
import useApiKey from "../hooks/useApiKey";
import { toast } from "react-toastify";
import { useTheme } from "../hooks/useTheme";

const ApiKeyComponent: React.FC = () => {
  const { apiKey, updateApiKey, deleteApiKey } = useApiKey();
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState<string>(apiKey || "");

  useEffect(() => {
    setInputValue(apiKey || "");
  }, [apiKey]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="flex flex-col w-72">
      <input
        type="text"
        placeholder="Enter API Key"
        value={inputValue}
        onChange={handleInputChange}
        className="input input-bordered mb-2"
      />
      <div className="flex space-x-2">
        <button
          onClick={() => {
            updateApiKey(inputValue);
            toast.success("API Key updated successfully", { theme });
          }}
          className="btn btn-primary"
        >
          Update
        </button>
        <button
          onClick={() => {
            deleteApiKey();
            toast.success("API Key deleted successfully", { theme });
          }}
          className="btn text-white btn-error"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ApiKeyComponent;
