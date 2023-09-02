import express from "express";
import {
  listChatHistories,
  getChatHistory,
  createChatHistory,
  updateChatHistory,
  deleteChatHistory,
} from "./../../entities/chat_history";

const router = express.Router();

const getAuthUserEmail = async () => {
  return "lgpelin92@gmail.com"
};

router.get("/", async (req, res) => {
  const userEmail = await getAuthUserEmail();
  if (!userEmail) return res.status(401).json({ error: "Unauthorized" });

  const chatHistories = await listChatHistories(userEmail);
  res.json(chatHistories);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const chatHistory = await getChatHistory(id);
  res.json(chatHistory);
});

router.post("/", async (req, res) => {
  const newChatHistory = await createChatHistory(req.body);
  res.status(201).json(newChatHistory);
});

router.put("/", async (req, res) => {
  if (!req.body.id) return res.json({ error: "Missing id parameter" });

  const updatedChatHistory = await updateChatHistory(req.body.id, req.body);
  res.json(updatedChatHistory);
});

router.delete("/", async (req, res) => {
  if (!req.body.id) return res.json({ error: "Missing id parameter" });

  await deleteChatHistory(req.body.id);
  res.status(200).json("Deleted");
});

export default router;
