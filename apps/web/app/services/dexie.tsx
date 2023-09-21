import { ChatHistory } from "@/types/shared";
import Dexie, { IndexableType } from "dexie";

const db = new Dexie("chatHistoryDB");
db.version(1).stores({
  chat_history: "++id, created_at",
});

type OmitChatHistoryKeys = Omit<ChatHistory, "id" | "created_at">;

export async function listChatHistories(): Promise<ChatHistory[]> {
  return await db.table("chat_history").toArray();
}

export async function getChatHistory(
  id: IndexableType,
): Promise<ChatHistory | null> {
  const chatHistory = await db.table("chat_history").get(id);
  return chatHistory || null;
}

export async function createChatHistory(
  newChatHistory: OmitChatHistoryKeys,
): Promise<ChatHistory | null> {
  const id = await db
    .table("chat_history")
    .add({ ...newChatHistory, created_at: new Date().toISOString() });
  return await getChatHistory(id);
}

export async function updateChatHistory(
  id: number,
  updates: OmitChatHistoryKeys,
): Promise<ChatHistory | null> {
  await db.table("chat_history").update(id, updates);
  return await getChatHistory(id);
}

export async function deleteChatHistory(id: number): Promise<void> {
  await db.table("chat_history").delete(id);
}
