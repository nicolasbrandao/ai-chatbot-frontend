"use client";

import Table, { Column } from "./../Table";
import { ChatHistory, Message } from "@/types/models/shared";
import { useRouter } from "next/navigation";
import { useChatHistories } from "@/app/hooks/useChatApi";

const ChatsTable: React.FC = () => {
  const { data: histories, isLoading } = useChatHistories();
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
    <Table
      columns={columns}
      data={histories || []}
      onRowClick={handleRowClick}
    />
  );
};

export default ChatsTable;

const CustomChatHistoryComponent: React.FC<{ data: Message[][] }> = ({
  data,
}) => {
  const chatHistory = data.flat();
  const lastThreeItems = chatHistory.slice(-3);

  return (
    <div>
      {lastThreeItems.map((item, index) => (
        <div key={index}>
          {item.type}:{item.message}
        </div>
      ))}
    </div>
  );
};
