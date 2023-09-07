"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import Drawer from "./Drawer";

const NavBar: React.FC = ({}) => {
  const { data } = useSession();
  const userImage = data?.user?.image;
  return (
    <div className="navbar bg-base-100 justify-between sticky flex gap-4 top-0 z-50 border-b">
      <div className="flex-none">
        <Drawer />
      </div>

      <div className="flex-none">
        <button className="btn btn-square btn-ghost rounded-full">
          {!userImage ? (
            <UserCircleIcon className="h-[40px] w-[40px]" />
          ) : (
            <Image
              className="rounded-full"
              src={userImage}
              alt="User Image"
              width={40}
              height={40}
            />
          )}
        </button>
      </div>
    </div>
  );
};

export default NavBar;
