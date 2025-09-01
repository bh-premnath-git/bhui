import { useMemo } from "react";
import { ROUTES } from "@/config/routes";
import { useNavigation } from "@/hooks/useNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

// Simple dummy data by category
const dataByCategory: Record<string, { id: string; title: string; lastMessageAt: string; }[]> = {
  [ROUTES.CHAT.MY_PIPELINE]: [
    { id: '1', title: 'ETL Pipeline Design', lastMessageAt: '1 day ago' },
    { id: '2', title: 'CDC Sync Strategy', lastMessageAt: '3 days ago' },
    { id: '3', title: 'Spark Optimization Tips', lastMessageAt: '5 days ago' },
  ],
  [ROUTES.CHAT.DATA_ONBOARD]: [
    { id: '1', title: 'Onboard Snowflake Source', lastMessageAt: '2 days ago' },
    { id: '2', title: 'S3 to Lakehouse Checklist', lastMessageAt: '4 days ago' },
    { id: '3', title: 'Data Contracts Kickoff', lastMessageAt: '7 days ago' },
  ],
  [ROUTES.CHAT.ALL]: Array.from({ length: 12 }).map((_, i) => ({
    id: `${i + 1}`,
    title: `Chat thread ${i + 1}`,
    lastMessageAt: `${Math.max(1, (i % 9) + 1)} day(s) ago`,
  }))
};

export default function ChatCategoryPage() {
  const navigation = useNavigation();
  const { pathname } = useLocation();

  const items = useMemo(() => dataByCategory[pathname] ?? dataByCategory[ROUTES.CHAT.ALL], [pathname]);

  const heading = useMemo(() => {
    if (pathname === ROUTES.CHAT.MY_PIPELINE) return 'My pipeline';
    if (pathname === ROUTES.CHAT.DATA_ONBOARD) return 'Data onboard';
    if (pathname === ROUTES.CHAT.ALL) return 'All chat';
    return 'Your chat history';
  }, [pathname]);

  const total = items.length;

  return (
    <div className="w-full h-full p-6 bg-muted/30">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">{heading}</h1>
          <Button onClick={() => navigation.handleNavigation(ROUTES.CHAT.ALL)} variant="default">+ New chat</Button>
        </div>

        <Input placeholder="Search your chats..." className="h-11 mb-3" />
        <p className="text-sm text-muted-foreground mb-4">You have {total} previous chats.</p>

        <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
          {items.map((chat) => (
            <Card
              key={chat.id}
              className={cn(
                "p-4 cursor-pointer transition-colors",
                "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => navigation.handleNavigation(ROUTES.CHAT.ALL)}
            >
              <div className="font-medium">{chat.title}</div>
              <div className="text-xs text-muted-foreground">Last message {chat.lastMessageAt}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}