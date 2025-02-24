import React from "react";
import { usePathname } from "next/navigation";
import { Coins, Home, MapPin, Medal, Settings, Trash } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

const sideBarItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/reports", label: "Report Waste", icon: MapPin },
  { href: "/collect", label: "Collect Waste", icon: Trash },
  { href: "/rewards", label: "Rewards", icon: Coins },
  { href: "/leaderboard", label: "Leaderboard", icon: Medal },
];

interface SidebarProps {
  open: boolean;
}

const Sidebar = ({ open }: SidebarProps) => {
  const pathname = usePathname();
  return (
    <aside
      className={`bg-white justify-between flex flex-col items-stretch pt-20 border-r  border-gray-200 lg:left-0 lg:translate-x-0  text-gray-800 w-64 fixed h-full z-30 inset-y-0 transition-all duration-300 ${
        open ? "left-0" : "-left-64"
      }`}
    >
      <div className="px-4 py-6 space-y-8">
        {sideBarItems.map((item, index) => (
          <Link href={item.href} key={index} passHref>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={`w-full justify-start py-3 ${
                pathname === item.href
                  ? "bg-green-100   text-green-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="text-base">{item.label}</span>
            </Button>
          </Link>
        ))}
      </div>
      <div className="p-4  border-t border-gray-200">
        <Link href="/logout" passHref>
          <Button
            variant={pathname === "/settings" ? "secondary" : "ghost"}
            className={`w-full border shadow-inner  py-3 ${
              pathname === "/settings"
                ? "bg-green-100 text-green-800"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            <span className="text-base">Settings</span>
          </Button>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
