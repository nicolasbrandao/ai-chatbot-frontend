"use client";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { UserCircleIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import Drawer from "./Drawer";
import { useEffect } from "react";
import { themeChange } from "theme-change";
import SignInButton from "./SignInButton";

const NavBar: React.FC = ({}) => {
  const session = useSession();
  const { data } = session;
  const userImage = data?.user?.image;

  useEffect(() => {
    themeChange(false);
  }, []);

  return (
    <div className="navbar bg-base-100 justify-between sticky flex gap-4 top-0 z-50 border-b">
      <div className="flex-none">
        <Drawer />
      </div>

      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="rounded-full">
          {session && session!.data?.user ? (
            !userImage ? (
              <UserCircleIcon className="h-[40px] w-[40px]" />
            ) : (
              <Image
                className="rounded-full"
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
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <button onClick={() => signOut()}>Sign Out</button>
          </li>
          <li>
            <label className="swap swap-rotate">
              {/* this hidden checkbox controls the state */}
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
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
