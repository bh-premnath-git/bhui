import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export const ChatHeader: React.FC = () => {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  const userName = userInfo?.name || userInfo?.username;

  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good Morning");
    else if (hours < 17) setGreeting("Good Afternoon");
    else if (hours < 21) setGreeting("Good Evening");
    else setGreeting("Good Day");
  }, []);

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-center py-6">
        <h1 className="text-xl md:text-2xl font-medium text-foreground">
          {greeting}, {userName}
        </h1>
      </div>
    </div>
  );
};
