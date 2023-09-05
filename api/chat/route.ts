import express from "express";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationChain } from "langchain/chains";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "langchain/schema";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { Message } from "./../../types/models/shared";

const router = express.Router();

function buildMessage(message: Message) {
  switch (message.type) {
    case "AI":
      return new AIMessage(message.message);
    case "USER":
      return new HumanMessage(message.message);
    case "SYSTEM":
      return new SystemMessage(message.message);
    default:
      throw new Error("Invalid message type");
  }
}

function buildMessages(history: Message[][]) {
  return history.map((messages) => messages.map(buildMessage));
}

router.post("/", async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    console.log({ body: req.body });
    const {
      message,
      systemMessage = "You are a helpful assistant",
      history = [],
    } = req.body;

    const model = new ChatOpenAI({ streaming: true });
    const historyMessages = buildMessages(history).flat();

    const memory = new BufferMemory({
      chatHistory: new ChatMessageHistory(historyMessages),
    });

    const chain = new ConversationChain({ llm: model, memory: memory });

    await chain.call(
      { input: message },
      {
        callbacks: [
          {
            handleLLMNewToken(token) {
              res.write(token);
            },
          },
        ],
      },
    );

    res.end();
  } catch (e) {
    console.log("Error: ", e);
    res.status(500).json({ error: e });
  }
});

export default router;
