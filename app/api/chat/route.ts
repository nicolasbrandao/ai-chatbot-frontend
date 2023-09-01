import { NextResponse, NextRequest } from "next/server";

import { ChatOpenAI } from "langchain/chat_models/openai";

import { BaseMessage, HumanMessage, SystemMessage } from "langchain/schema";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const {
    message,
    systemMessage = "You are a helpful assistant that translates English to Portuguese.",
    history = [] as BaseMessage[][],
  } = data;
  try {
    const chat = new ChatOpenAI({});
    const response = await chat.generate([
      ...history,
      [(new SystemMessage(systemMessage), new HumanMessage(message))],
    ]);

    const { generations } = response;
    return NextResponse.json(generations);
  } catch (e) {
    if (e instanceof Error) {
      return NextResponse.json(e.message, { status: 500 });
    }
    return NextResponse.json(e, { status: 500 });
  }
}
