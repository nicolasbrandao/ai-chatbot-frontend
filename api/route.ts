import express from "express";
import chatRouter from "./chat/route";
import chatHistoryRoute from "./chat_history/route";

export const chatRoutes = express.Router();

// POST route from chat/route.ts
chatRoutes.use("/api2/chat", chatRouter);

// GET route from chat/route.ts
chatRoutes.use("/api2/chat-history", chatHistoryRoute);
