"use client";

import {
  isPreviousMonth,
  isPreviousWeek,
  isToday,
  isYesterday,
} from "@/shared/utils";
import { useChats } from "../hooks/useChatLocalApi";
import ChatPreview from "./ChatPreview";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function HistoryMenu() {
  const { push } = useRouter();
  const { data: session } = useSession();
  const { data: chats, isLoading } = useChats();

  // TODO: maybe we can do this another way
  const todayChats =
    chats?.filter((chat) => isToday(new Date(chat.created_at))) ?? [];
  const yesterdayChats =
    chats?.filter((chat) => isYesterday(new Date(chat.created_at))) ?? [];
  const previousWeekChats =
    chats?.filter((chat) => isPreviousWeek(new Date(chat.created_at))) ?? [];
  const previousMonth =
    chats?.filter((chat) => isPreviousMonth(new Date(chat.created_at))) ?? [];

  return (
    <div
      className={`hidden md:${
        !session ? "hidden" : "menu"
      } p-4 w-fit min-w-[307px] min-h-full bg-base-200 text-base-content`}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-lg m-auto" />
      ) : (
        <ul className="w-full h-full">
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
        </ul>
      )}
    </div>
  );
}
