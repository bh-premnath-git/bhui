import React from "react";
import { ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import logo from "/assets/logo/fixLogo.svg";

interface HeaderProps {
  isAuthenticated?: boolean;
  logout?: () => void;
}

export function Header(props: HeaderProps) {

  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;

  const renderHeaderContent = (renderContent: (() => React.ReactNode) | React.ReactNode | string) => {
    if (typeof renderContent === 'function') {
      return renderContent();
    }
    if (React.isValidElement(renderContent)) {
      return renderContent;
    }
    if (typeof renderContent === 'string') {
      return <div className="text-lg font-semibold">{renderContent}</div>;
    }
    return null;
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b">
      <div className="flex items-center">
        <div className="pr-4 border-r">
          <img
            src={logo}
            className="h-8 w-8 cursor-pointer"
            sizes="(min-width: 904px) 32vw, 64vw"
            width={32}
            height={32}
            onClick={() => navigate("/dashboard")}
          />
        </div>
        <div className="pl-4">
          {renderHeaderContent(renderingHeadContent(pathname))}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="flex items-center space-x-3 bg-transparent hover:bg-gray-100 p-2 rounded-lg transition-colors">
            <img
              src="https://assets.imgix.net/examples/pione.jpg"
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="rounded-full"
              width={24}
              height={24}
              alt="User avatar"
            />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">John Doe</span>
              <span className="text-xs text-gray-500">Admin</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function renderingHeadContent(content: string) {
  // console.log(content);
  if (content === "/dashboard") {
    return <span className="w-2/5 font-bold">Dashboard</span>;
  }
  return "";
}