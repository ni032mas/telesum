import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Clock, Bot } from "lucide-react";
import type { Summary } from "@/api/summaries";

export function SummaryCard({ summary }: { summary: Summary }) {
  return (
    <Link to={`/summaries/${summary.id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {summary.chat_title}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {new Date(summary.created_at).toLocaleString()}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {summary.content.substring(0, 200)}...
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {summary.message_count} messages
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {summary.hours_back}h
            </span>
            <span className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              {summary.llm_cli}/{summary.llm_model}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
