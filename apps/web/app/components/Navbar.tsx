"use client";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import {
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Drawer from "./Drawer";
import { useEffect } from "react";
import { themeChange } from "theme-change";
import ApiKeyComponent from "./ApiKey";
import { useParams } from "next/navigation";
import { useChat } from "../hooks/useChatLocalApi";
import { useRouter } from "next/navigation";
import { useTheme } from "../hooks/useTheme";

const NavBar: React.FC = ({}) => {
  const { push } = useRouter();
  const { theme, dispatch } = useTheme();
  const session = useSession();
  const { data: sessionData } = session;
  const userImage = sessionData?.user?.image;
  const { id: rawId } = useParams();
  const id = rawId ? parseInt(rawId as string) : undefined;
  const { data: chat } = useChat(id);
  const title = chat?.title ?? "New chat";

  useEffect(() => {
    themeChange(false);
  }, []);

  return (
    <div
      className={`${
        !sessionData ? "hidden" : "navbar"
      } bg-base-100 justify-between sticky flex gap-4 top-0 w-screen z-50 border-b border-base-200 ${
        !sessionData ?? "hidden"
      }`}
    >
      <button
        className="w-[290px] hidden md:btn md:btn-primary"
        onClick={() => push("/")}
      >
        <PlusIcon className="h-6 w-6" />
        New Chat
      </button>
      <div className="flex-none md:hidden">
        <Drawer />
      </div>
      <div className="w-[150px] md:w-fit">
        <p className="text-xl truncate mx-auto">{title}</p>
      </div>
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="rounded-full">
          {session && session!.data?.user?.image ? (
            !userImage ? (
              <UserCircleIcon className="h-[40px] w-[40px] cursor-pointer" />
            ) : (
              <Image
                className="rounded-full cursor-pointer h-[40px] w-[40px]"
                src={userImage}
                alt="User Image"
                width={40}
                height={40}
              />
            )
          ) : (
            <button className="btn" onClick={() => push("/login")}>
              Sign In
            </button>
          )}
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content z-1 menu-lg p-2 shadow bg-base-300 rounded-box mt-4"
        >
          <li>
            <ApiKeyComponent />
          </li>
          <li className="flex gap-4 items-center justify-center">
            <p className="w-[150px] p-0">Toggle Theme</p>
            <label className="swap swap-rotate">
              <input
                data-toggle-theme="dark,light"
                data-act-class="ACTIVECLASS"
                type="checkbox"
                onChange={() => {
                  themeChange();
                  dispatch({
                    type: "UPDATE_THEME",
                    payload: theme === "dark" ? "light" : "dark",
                  });
                }}
              />
              <SunIcon className="swap-on fill-current w-5 h-5" />
              <MoonIcon className="swap-off fill-current w-5 h-5" />
            </label>
          </li>
          <li>
            <button onClick={() => signOut()}>Sign Out</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
