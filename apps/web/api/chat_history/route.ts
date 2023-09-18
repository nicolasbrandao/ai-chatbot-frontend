import express from "express";
import {
  listChatHistories,
  getChatHistory,
  createChatHistory,
  updateChatHistory,
  deleteChatHistory,
} from "../entities/chat_history";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    // TODO - add authentication getting the supabase token and checking if the user is logged in
    // if (!userEmail) return res.status(401).json({ error: "Unauthorized" });

    const chatHistories = await listChatHistories();
    res.json(chatHistories);
  } catch (e) {
    console.log({ error: e });
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const chatHistory = await getChatHistory(id);
    res.json(chatHistory);
  } catch (e) {
    console.log({ error: e });
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const newChatHistory = await createChatHistory(req.body);
    res.status(200).json(newChatHistory);
  } catch (e) {
    console.log({ error: e });
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(" updating chat history");
    console.log(req.body);
    if (!id) return res.json({ error: "Missing id parameter" });

    const updatedChatHistory = await updateChatHistory(id, req.body);
    res.json(updatedChatHistory);
  } catch (e) {
    console.log({ error: e });
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.json({ error: "Missing id parameter" });
    await deleteChatHistory(id);
    res.status(200).json("Deleted");
  } catch (e) {
    console.log({ error: e });
    next(e);
  }
});

export default router;
