import { Bars3Icon, PlusIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useChats } from "../hooks/useChatLocalApi";
import ChatPreview from "./ChatPreview";
import {
  isToday,
  isYesterday,
  isPreviousWeek,
  isPreviousMonth,
} from "@/shared/utils";

export default function Drawer() {
  const { data: chats, isLoading } = useChats();
  const { push } = useRouter();

  const todayChats =
    chats?.filter((chat) => isToday(new Date(chat.created_at))) ?? [];
  const yesterdayChats =
    chats?.filter((chat) => isYesterday(new Date(chat.created_at))) ?? [];
  const previousWeekChats =
    chats?.filter((chat) => isPreviousWeek(new Date(chat.created_at))) ?? [];
  const previousMonth =
    chats?.filter((chat) => isPreviousMonth(new Date(chat.created_at))) ?? [];

  return (
    <div className="drawer z-10">
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
            <span className="loading loading-spinner loading-lg mx-auto" />
          ) : (
            <>
              {todayChats.length > 0 && (
                <>
                  <span className="font-bold text-xs divider">Today</span>
                  {todayChats!.map((history, i) => (
                    <li
                      onClick={() => {
                        push(`/${history.id}`);
                      }}
                      key={i}
                    >
                      <ChatPreview id={history.id!} />
                    </li>
                  ))}
                </>
              )}
              {yesterdayChats.length > 0 && (
                <>
                  <span className="font-bold text-xs divider">Yesterday</span>
                  {yesterdayChats!.map((history, i) => (
                    <li
                      onClick={() => {
                        push(`/${history.id}`);
                      }}
                      key={i}
                    >
                      <ChatPreview id={history.id!} />
                    </li>
                  ))}
                </>
              )}
              {previousWeekChats.length > 0 && (
                <>
                  <span className="font-bold text-xs divider">
                    Previous 7 Days
                  </span>
                  {previousWeekChats!.map((history, i) => (
                    <li
                      onClick={() => {
                        push(`/${history.id}`);
                      }}
                      key={i}
                    >
                      <ChatPreview id={history.id!} />
                    </li>
                  ))}
                </>
              )}
              {previousMonth.length > 0 && (
                <>
                  <span className="font-bold text-xs divider">
                    Older than 7 Days
                  </span>
                  {previousMonth!.map((history, i) => (
                    <li
                      onClick={() => {
                        push(`/${history.id}`);
                      }}
                      key={i}
                    >
                      <ChatPreview id={history.id!} />
                    </li>
                  ))}
                </>
              )}
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
