import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLogs } from "@/api/logs";
import { RefreshCw, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

export function LogPanel() {
  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (scrollRef.current && !collapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, collapsed]);

  async function fetchLogs() {
    try {
      setLoading(true);
      const data = await getLogs(200);
      setLines(data.lines);
    } catch {
      setLines(["Failed to load logs"]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3 px-6 space-y-0">
        <CardTitle className="text-base">Server Logs</CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={fetchLogs} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent>
          <pre
            ref={scrollRef}
            className="bg-muted rounded-md p-3 text-xs font-mono overflow-auto max-h-64 whitespace-pre-wrap break-all"
          >
            {lines.length === 0
              ? "No logs yet"
              : lines.join("\n")}
          </pre>
        </CardContent>
      )}
    </Card>
  );
}
