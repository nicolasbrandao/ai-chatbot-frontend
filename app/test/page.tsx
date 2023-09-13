"use client";
import { useState } from "react";
import { getConversationalQa } from "../services/langchain";
import useApiKey from "../hooks/useApiKey";

export default function Page() {
  const [answer, setAnswer] = useState("");
  const { apiKey } = useApiKey();
  const makeSillyQuestion = async () => {
    const agent = await getConversationalQa(apiKey!);

    const result = await agent.call({
      input: "How god create the earth on the bible ?  ",
    });
    console.log({ result });

    setAnswer(result.output);
  };

  return (
    <div>
      <button onClick={makeSillyQuestion}>Make silly question</button>
      <p>{answer}</p>
    </div>
  );
}
