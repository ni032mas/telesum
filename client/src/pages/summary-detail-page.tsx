import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SummaryViewer } from "@/components/summary-viewer";
import {
  getSummary,
  deleteSummary,
  type Summary,
} from "@/api/summaries";
import {
  Loader2,
  ArrowLeft,
  Trash2,
  MessageSquare,
  Clock,
  Bot,
} from "lucide-react";

export function SummaryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) loadSummary(parseInt(id));
  }, [id]);

  async function loadSummary(summaryId: number) {
    try {
      setLoading(true);
      setError("");
      const data = await getSummary(summaryId);
      setSummary(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load summary"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!summary || !confirm("Delete this summary?")) return;
    try {
      setDeleting(true);
      await deleteSummary(summary.id);
      navigate("/summaries");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete summary"
      );
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading summary...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/summaries")}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/summaries")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Summaries
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Delete
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{summary.chat_title}</CardTitle>
          <CardDescription>
            {new Date(summary.created_at).toLocaleString()}
          </CardDescription>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {summary.message_count} messages
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {summary.hours_back}h window
            </span>
            <span className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              {summary.llm_cli}/{summary.llm_model}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <SummaryViewer content={summary.content} />
        </CardContent>
      </Card>
    </div>
  );
}
