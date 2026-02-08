import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Users } from "lucide-react";
import type { ChatInfo } from "@/api/chats";

export function ChatCard({ chat }: { chat: ChatInfo }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{chat.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {chat.type}
          </span>
          {chat.participants_count && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {chat.participants_count}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground font-mono">
          {chat.id}
        </p>
      </CardContent>
    </Card>
  );
}
