import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "@/components/summary-card";
import { getSummaries, type Summary } from "@/api/summaries";
import { Loader2, RefreshCw } from "lucide-react";

export function SummariesPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSummaries();
  }, []);

  async function loadSummaries() {
    try {
      setLoading(true);
      setError("");
      const data = await getSummaries();
      setSummaries(data.summaries);
      setTotal(data.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load summaries"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Summaries</h2>
          <p className="text-sm text-muted-foreground">
            {total} total summaries
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSummaries}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading summaries...
        </div>
      ) : summaries.length === 0 ? (
        <p className="text-muted-foreground">
          No summaries yet. Go to Dashboard and click "Run Now" to create one.
        </p>
      ) : (
        <div className="grid gap-3">
          {summaries.map((summary) => (
            <SummaryCard key={summary.id} summary={summary} />
          ))}
        </div>
      )}
    </div>
  );
}
