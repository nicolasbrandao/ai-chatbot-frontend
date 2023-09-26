import { Bars3Icon, PlusIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useListChatHistories } from "../hooks/useChatLocalApi";
import ChatPreview from "./ChatPreview";

export default function Drawer() {
  const { data: histories, isLoading } = useListChatHistories();
  const { push } = useRouter();
  return (
    <div className="drawer">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label htmlFor="my-drawer" className="btn drawer-button">
          <Bars3Icon className="h-6 w-6" />
        </label>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
          <li className="mb-4">
            <div className="mx-auto p-0">
              <button
                className="btn btn-primary btn-wide"
                onClick={() => push("/")}
              >
                <PlusIcon className="h-6 w-6" />
                New Chat
              </button>
            </div>
          </li>
          {isLoading ? (
            <span className="loading loading-spinner loading-lg mx-auto"></span>
          ) : (
            histories!.map((history, i) => (
              <li
                onClick={() => {
                  push(`/${history.id}`);
                }}
                className="hover"
                key={i}
              >
                <ChatPreview id={history.id!} />
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
