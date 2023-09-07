"use client";

import Table, { Column } from "./../Table";
import { ChatHistory, Message } from "@/types/models/shared";
import { useRouter } from "next/navigation";
import { useChatHistories, useDeleteChatHistory } from "@/app/hooks/useChatApi";
import ChatPreview from "../ChatPreview";

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
      render: (data) => <ChatPreview chat_history={data as Message[][]} />,
    },
    {
      header: "Delete",
      accessor: "id",
      render: (data) => <CustomDeleteComponent id={data as string | number} />,
    },
  ];

  return !isLoading ? (
    <>
      <Table
        columns={columns}
        data={histories || []}
        onRowClick={handleRowClick}
      />
      <button
        className="sticky bottom-10 left-10 z-50 btn"
        onClick={() => push("/chat/new")}
      >
        New Chat
      </button>
    </>
  ) : (
    <div className="loading loading-lg"></div>
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

const CustomDeleteComponent: React.FC<{ id: number | string }> = ({ id }) => {
  const deleteChatHistory = useDeleteChatHistory();

  const handleDelete = async () => {
    try {
      await deleteChatHistory.mutateAsync(`${id}`);
      alert("Deleted Successfully");
    } catch (e) {
      alert("Something went wrong");
      console.log({ e });
    }
  };
  return (
    <div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        className="btn btn-warning"
      >
        Delete {id}
      </button>
    </div>
  );
};
