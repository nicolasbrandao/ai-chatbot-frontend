"use client";

import React, { useEffect, useState } from "react";
import Table, { Column } from "./../Table";
import { ChatHistory, Message } from "@/types/models/shared";
import { useRouter } from "next/navigation";

const ChatsTable: React.FC = () => {
  const [histories, setHistories] = useState<ChatHistory[]>([]);
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api2/chat-history`);
        if (res.ok) {
          const chats = await res.json();
          setHistories(chats);
        } else {
          throw new Error("Request failed");
        }
      } catch (e) {
        console.log("Error: ", e);
      }
    };
    fetchChats();
  }, []);

  const { push } = useRouter();

  const handleRowClick = (rowData: ChatHistory) => {
    push(`/chat/${rowData.id}`);
  };

  const columns: Column<ChatHistory>[] = [
    { header: "ID", accessor: "id" },
    { header: "User Email", accessor: "user_email" },
    { header: "Created At", accessor: "created_at" },
    {
      header: "Chat History",
      accessor: "chat_history",
      render: (data) => (
        <CustomChatHistoryComponent data={data as Message[][]} />
      ),
    },
  ];

  return (
    <Table columns={columns} data={histories} onRowClick={handleRowClick} />
  );
};

export default ChatsTable;

function CustomChatHistoryComponent({ data }: { data: Message[][] }) {
  const chatHistory = data.flat();
  const lastThreeItems = chatHistory.slice(-3);

  return (
    <div>
      <div>.</div>
      <div>.</div>
      <div>.</div>
      {lastThreeItems.map((item, index) => (
        <div key={index}>
          {item.type}:{item.message}
        </div>
      ))}
    </div>
  );
}
