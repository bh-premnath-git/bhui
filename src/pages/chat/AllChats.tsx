import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Dummy list of all chats (could be same as history for now)
const allChats = Array.from({ length: 20 }).map((_, i) => ({
  id: `${i + 1}`,
  title: `Chat thread ${i + 1}`,
  lastMessageAt: `${Math.max(1, (i % 9) + 1)} day(s) ago`
}));

export default function AllChats() {
  const total = useMemo(() => allChats.length, []);

  return (
    <div className="w-full h-full p-6 bg-muted/30">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Your chat history</h1>
          <Button>+ New chat</Button>
        </div>

        <Input placeholder="Search your chats..." className="h-11 mb-3" />
        <p className="text-sm text-muted-foreground mb-4">You have {total} previous chats.</p>

        <div className="grid gap-3">
          {allChats.map((chat) => (
            <Card key={chat.id} className="p-4">
              <div className="font-medium">{chat.title}</div>
              <div className="text-xs text-muted-foreground">Last message {chat.lastMessageAt}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}