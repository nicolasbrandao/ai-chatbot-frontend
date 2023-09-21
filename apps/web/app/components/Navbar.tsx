"use client";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { UserCircleIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import Drawer from "./Drawer";
import { useEffect } from "react";
import { themeChange } from "theme-change";
import SignInButton from "./SignInButton";
import ApiKeyComponent from "./ApiKey";
import { useChat } from "../hooks/useChat";

const NavBar: React.FC = ({}) => {
  const session = useSession();
  const { data } = session;
  const userImage = data?.user?.image;
  const { chatHistory } = useChat();
  const title = chatHistory?.title ?? "Untitled";
  useEffect(() => {
    themeChange(false);
  }, []);

  return (
    <div className="navbar bg-base-100 justify-between sticky flex gap-4 top-0 z-50 border-b">
      <div className="flex-none">
        <Drawer />
      </div>
      <h1 className="text-3xl">{title}</h1>
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="rounded-full">
          {session && session!.data?.user ? (
            !userImage ? (
              <UserCircleIcon className="h-[40px] w-[40px] cursor-pointer" />
            ) : (
              <Image
                className="rounded-full cursor-pointer"
                src={userImage}
                alt="User Image"
                width={40}
                height={40}
              />
            )
          ) : (
            <SignInButton />
          )}
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content z-1 menu-lg p-2 shadow bg-base-300 rounded-box"
        >
          <li className="flex gap-4 items-center justify-center">
            <p className="w-[150px] p-0">Toggle Theme</p>
            <label className="swap swap-rotate">
              <input
                data-toggle-theme="forest,light"
                data-act-class="ACTIVECLASS"
                type="checkbox"
                onChange={() => themeChange()}
              />
              <SunIcon className="swap-on fill-current w-5 h-5" />
              <MoonIcon className="swap-off fill-current w-5 h-5" />
            </label>
          </li>
          <li>
            <ApiKeyComponent />
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
