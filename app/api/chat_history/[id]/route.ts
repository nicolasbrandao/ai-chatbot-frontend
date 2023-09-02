import { NextResponse, NextRequest } from "next/server";

import { getChatHistory } from "@/entities/chat_history";

export async function GET(req: NextRequest, { params: { id } }: any) {
  const chatHistory = await getChatHistory(id);
  return NextResponse.json(chatHistory);
}
