import { NextResponse, NextRequest } from "next/server";

import {
  listChatHistories,
  getChatHistory,
  createChatHistory,
  updateChatHistory,
  deleteChatHistory,
} from "@/entities/chat_history";
import { Session, getServerSession } from "next-auth";
import authConfig from "@/shared/auth";

const getAuthUserEmail = async () => {
  const session = await getServerSession(authConfig);
  return session?.user?.email;
};

export async function GET(req: NextRequest) {
  console.log("batata");

  const userEmail = await getAuthUserEmail();
  console.log("userEmail", userEmail);
  if (userEmail == undefined)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chatHistories = await listChatHistories(userEmail);
  return NextResponse.json(chatHistories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newChatHistory = await createChatHistory(body);
  return NextResponse.json(newChatHistory, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "Missing id parameter" });
  const updatedChatHistory = await updateChatHistory(body.id as string, body);
  return NextResponse.json(updatedChatHistory);
}

export async function DELETE(req: NextRequest) {
  const query = await req.json();
  if (!query.id) {
    return NextResponse.json({ error: "Missing id parameter" });
  }
  await deleteChatHistory(query.id as string);
  return NextResponse.json("Deleted", { status: 200 });
}
