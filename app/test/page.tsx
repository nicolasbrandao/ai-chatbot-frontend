"use client";
import { useState } from "react";
import { getConversationalQa } from "../services/langchain";
import useApiKey from "../hooks/useApiKey";
import { RetrievalQAChain } from "langchain/chains";

export default function Page() {
  const [answer, setAnswer] = useState("");
  const { apiKey } = useApiKey();
  const makeSillyQuestion = async () => {
    const agent: RetrievalQAChain = await getConversationalQa(apiKey!);

    const result = await agent.call({
      question: "How god create the earth?",
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
