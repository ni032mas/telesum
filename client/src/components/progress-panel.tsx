import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export interface ProgressEvent {
  type:
    | "connected"
    | "start"
    | "collecting"
    | "summarizing"
    | "sending"
    | "done"
    | "error";
  running?: boolean;
  chat_id?: string;
  chat_title?: string;
  message?: string;
  current?: number;
  total?: number;
}

export function ProgressPanel({ event }: { event: ProgressEvent | null }) {
  if (!event) return null;

  const isActive =
    event.type === "collecting" ||
    event.type === "summarizing" ||
    event.type === "sending" ||
    event.type === "start";
  const isDone = event.type === "done";
  const isError = event.type === "error";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {isActive && <Loader2 className="h-4 w-4 animate-spin" />}
          {isDone && <CheckCircle className="h-4 w-4 text-green-500" />}
          {isError && <AlertCircle className="h-4 w-4 text-red-500" />}
          Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        {event.message && (
          <p className="text-sm text-muted-foreground">{event.message}</p>
        )}
        {event.current != null && event.total != null && (
          <div className="mt-2">
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${(event.current / event.total) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {event.current} / {event.total}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
