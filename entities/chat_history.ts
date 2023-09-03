import { getSupabaseInstance } from "./../services/supabase";
import { Database } from "./../types/database/supabase-generated.types";

type ChatHistoryTable = Database["public"]["Tables"]["chat_history"];
type ChatHistoryRow = ChatHistoryTable["Row"];
type OmitChatHistoryKeys = Omit<ChatHistoryRow, "id" | "created_at">;

export async function listChatHistories(): Promise<ChatHistoryRow[]> {
  // email: string
  const supabase = getSupabaseInstance();
  const { data, error } = await supabase
    .from<"chat_history", ChatHistoryTable>("chat_history")
    .select("*");
  if (error) throw error;
  return data || {};
}

export async function getChatHistory(
  id: string,
): Promise<ChatHistoryRow | null> {
  const supabase = getSupabaseInstance();
  const { data, error } = await supabase
    .from<"chat_history", ChatHistoryTable>("chat_history")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data || {};
}

export async function createChatHistory(
  newChatHistory: OmitChatHistoryKeys,
): Promise<ChatHistoryRow> {
  const supabase = getSupabaseInstance();
  const { data, error } = await supabase
    .from<"chat_history", ChatHistoryTable>("chat_history")
    .insert([newChatHistory])
    .single();
  if (error) throw error;
  return data!;
}

export async function updateChatHistory(
  id: string,
  updates: OmitChatHistoryKeys,
): Promise<ChatHistoryTable> {
  const supabase = getSupabaseInstance();
  const { data, error } = await supabase
    .from<"chat_history", ChatHistoryTable>("chat_history")
    .update(updates)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data!;
}

export async function deleteChatHistory(id: string): Promise<void> {
  const supabase = getSupabaseInstance();
  const { error } = await supabase.from("chat_history").delete().eq("id", id);
  if (error) throw error;
}
