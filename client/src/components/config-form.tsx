import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getConfig, updateConfig, getPrompt, updatePrompt, type MaskedConfig } from "@/api/config";
import { Loader2, Save, CheckCircle, RotateCcw } from "lucide-react";

export function ConfigForm() {
  const [config, setConfig] = useState<MaskedConfig | null>(null);
  const [form, setForm] = useState<Partial<MaskedConfig>>({});
  const [prompt, setPrompt] = useState("");
  const [defaultPrompt, setDefaultPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      setLoading(true);
      const [data, promptData] = await Promise.all([getConfig(), getPrompt()]);
      setConfig(data);
      setForm(data);
      setPrompt(promptData.prompt);
      setDefaultPrompt(promptData.defaultPrompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load config");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess(false);

      // Only send fields that changed (and aren't masked)
      const updates: Partial<MaskedConfig> = {};
      for (const [key, value] of Object.entries(form)) {
        const k = key as keyof MaskedConfig;
        if (value !== config?.[k] && !value?.endsWith("***")) {
          updates[k] = value;
        }
      }

      const [data] = await Promise.all([
        updateConfig(updates),
        updatePrompt(prompt),
      ]);
      setConfig(data);
      setForm(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save config");
    } finally {
      setSaving(false);
    }
  }

  function updateField(key: keyof MaskedConfig, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Configuration saved successfully.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Telegram API</CardTitle>
          <CardDescription>
            Get your API credentials from{" "}
            <a
              href="https://my.telegram.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              my.telegram.org
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-id">API ID</Label>
            <Input
              id="api-id"
              value={form.TG_API_ID || ""}
              onChange={(e) => updateField("TG_API_ID", e.target.value)}
              placeholder="12345678"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-hash">API Hash</Label>
            <Input
              id="api-hash"
              value={form.TG_API_HASH || ""}
              onChange={(e) => updateField("TG_API_HASH", e.target.value)}
              placeholder="Enter API hash"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Source Chats</CardTitle>
          <CardDescription>
            Comma-separated chat IDs or usernames to read messages from
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source-chat">Source Chats</Label>
            <Input
              id="source-chat"
              value={form.SOURCE_CHAT || ""}
              onChange={(e) => updateField("SOURCE_CHAT", e.target.value)}
              placeholder="-1001234567890, @channelname"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bot Mode (Optional)</CardTitle>
          <CardDescription>
            Configure bot token to send summaries via Telegram bot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bot-token">Bot Token</Label>
            <Input
              id="bot-token"
              value={form.TG_BOT_TOKEN || ""}
              onChange={(e) => updateField("TG_BOT_TOKEN", e.target.value)}
              placeholder="123456:ABC-DEF..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dest-user">Destination User ID</Label>
            <Input
              id="dest-user"
              value={form.DEST_USER_ID || ""}
              onChange={(e) => updateField("DEST_USER_ID", e.target.value)}
              placeholder="123456789"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dest-chat">Destination Chats (userbot)</Label>
            <Input
              id="dest-chat"
              value={form.DEST_CHAT || ""}
              onChange={(e) => updateField("DEST_CHAT", e.target.value)}
              placeholder="-1001234567890"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summarization</CardTitle>
          <CardDescription>LLM and time range settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hours-back">Hours Back</Label>
            <Input
              id="hours-back"
              type="number"
              value={form.HOURS_BACK || "24"}
              onChange={(e) => updateField("HOURS_BACK", e.target.value)}
            />
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="llm-cli">LLM CLI</Label>
              <Input
                id="llm-cli"
                value={form.LLM_CLI || ""}
                onChange={(e) => updateField("LLM_CLI", e.target.value)}
                placeholder="claude"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="llm-model">Model</Label>
              <Input
                id="llm-model"
                value={form.LLM_MODEL || ""}
                onChange={(e) => updateField("LLM_MODEL", e.target.value)}
                placeholder="sonnet"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prompt Template</CardTitle>
              <CardDescription>
                LLM prompt for summarization. Uses {"{messages}"} and {"{hours}"}{" "}
                placeholders.
              </CardDescription>
            </div>
            {prompt !== defaultPrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt(defaultPrompt)}
              >
                <RotateCcw className="h-4 w-4" />
                Reset to default
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saving ? "Saving..." : "Save Configuration"}
      </Button>
    </div>
  );
}
