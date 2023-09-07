import { Message } from "@/types/models/shared";
import React, { useEffect, useState } from "react";
import { useChatHistories } from "../hooks/useChatApi";
import ChatPreview from "./ChatPreview";

const ChatHistoryDrawer: React.FC = () => {
  const { data: histories, isLoading } = useChatHistories();

  return (
    <div className="drawer">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label htmlFor="my-drawer" className="btn btn-primary drawer-button">
          Chat History
        </label>
      </div>
      <div className="drawer-side z-100">
        <label htmlFor="my-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
          {histories?.map((h, i) => (
            <li className="Hover" key={i}>
              <ChatPreview chat_history={h.chat_history} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatHistoryDrawer;
