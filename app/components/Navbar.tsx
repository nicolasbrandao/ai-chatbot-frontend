"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import ChatHistoryDrawer from "./Drawer";

const NavBar: React.FC = ({}) => {
  const { data } = useSession();
  const userImage = data?.user?.image;
  return (
    <div className="navbar bg-base-100 sticky flex gap-4 top-0 z-50">
      <div className="flex-1">
        <a href="/chat" className="btn btn-ghost normal-case text-xl">
          AI ChatBot{" "}
        </a>
      </div>
      <ChatHistoryDrawer />
      <div className="flex-none">
        <button className="btn btn-square btn-ghost rounded-full">
          {!userImage ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-5 h-5 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
              ></path>
            </svg>
          ) : (
            <Image
              className="rounded-full"
              src={userImage!}
              alt="User Image"
              width={30}
              height={30}
            />
          )}
        </button>
      </div>
    </div>
  );
};

export default NavBar;
