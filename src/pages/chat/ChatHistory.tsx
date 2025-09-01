import { useMemo } from "react";
import { ROUTES } from "@/config/routes";
import { useNavigation } from "@/hooks/useNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Dummy chat items
const dummyChats = Array.from({ length: 12 }).map((_, i) => ({
  id: `${i + 1}`,
  title: [
    "Data Pipeline Brewing Analogy",
    "Email Newsletter Drafting",
    "Dashboard UI/UX Design Review",
    "Modern Login Screen Design",
    "React Login Screen Component",
    "React Flow Layout Algorithms"
  ][i % 6],
  lastMessageAt: `${(i + 1)} day${i + 1 > 1 ? 's' : ''} ago`
}));

export default function ChatHistory() {
  const navigation = useNavigation();

  const total = useMemo(() => dummyChats.length, []);

  return (
    <div className="w-full h-full p-6 bg-muted/30">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Your chat history</h1>
          <Button onClick={() => navigation.handleNavigation(ROUTES.CHAT.ALL)} variant="default">+ New chat</Button>
        </div>

        <Input placeholder="Search your chats..." className="h-11 mb-3" />
        <p className="text-sm text-muted-foreground mb-4">You have {total} previous chats.</p>

        <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
          {dummyChats.map((chat) => (
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