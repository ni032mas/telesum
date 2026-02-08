import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChatCard } from "@/components/chat-card";
import { ProgressPanel, type ProgressEvent } from "@/components/progress-panel";
import { useSse } from "@/hooks/use-sse";
import { getChats, type ChatInfo } from "@/api/chats";
import { startSummarization } from "@/api/summarize";
import { LogPanel } from "@/components/log-panel";
import { Loader2, Play, RefreshCw } from "lucide-react";

export function DashboardPage() {
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  const { data: progress } = useSse<ProgressEvent>({
    url: "/api/summarize/status",
    enabled: true,
  });

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (progress) {
      if (progress.type === "start" || progress.type === "collecting" || progress.type === "summarizing" || progress.type === "sending") {
        setRunning(true);
      }
      if (progress.type === "done" && progress.current === progress.total) {
        setRunning(false);
      }
      if (progress.type === "error") {
        setRunning(false);
      }
      if (progress.type === "connected") {
        setRunning(!!progress.running);
      }
    }
  }, [progress]);

  async function loadChats() {
    try {
      setLoading(true);
      setError("");
      const data = await getChats();
      setChats(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load chats"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRunNow() {
    try {
      setError("");
      setRunning(true);
      await startSummarization();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start summarization"
      );
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadChats} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleRunNow} disabled={running}>
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {running ? "Running..." : "Run Now"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ProgressPanel event={progress} />

      <div>
        <h3 className="text-lg font-semibold mb-3">Source Chats</h3>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading chats...
          </div>
        ) : chats.length === 0 ? (
          <p className="text-muted-foreground">
            No source chats configured. Go to Settings to add them.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {chats.map((chat) => (
              <ChatCard key={chat.id} chat={chat} />
            ))}
          </div>
        )}
      </div>

      <LogPanel />
    </div>
  );
}
