import express from "express";
import {
  listChatHistories,
  getChatHistory,
  createChatHistory,
  updateChatHistory,
  deleteChatHistory,
} from "./../../entities/chat_history";

const router = express.Router();

router.get("/", async (req, res) => {
  // TODO - add authentication getting the supabase token and checking if the user is logged in
  // if (!userEmail) return res.status(401).json({ error: "Unauthorized" });

  const chatHistories = await listChatHistories();
  res.json(chatHistories);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const chatHistory = await getChatHistory(id);
  res.json(chatHistory);
});

router.post("/", async (req, res) => {
  const newChatHistory = await createChatHistory(req.body);
  res.status(200).json(newChatHistory);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  console.log(" updating chat history");
  console.log(req.body);
  if (!req.body.id) return res.json({ error: "Missing id parameter" });

  const updatedChatHistory = await updateChatHistory(id, req.body);
  res.json(updatedChatHistory);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) return res.json({ error: "Missing id parameter" });
  await deleteChatHistory(id);
  res.status(200).json("Deleted");
});

export default router;
