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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge } from "./status-badge";
import {
  getAuthStatus,
  sendCode,
  verifyCode,
  verifyPassword,
} from "@/api/auth";
import { Loader2, Phone, KeyRound, Lock, CheckCircle } from "lucide-react";

type Step = "check" | "phone" | "code" | "password" | "done";

export function AuthWizard() {
  const [step, setStep] = useState<Step>("check");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    try {
      setLoading(true);
      const status = await getAuthStatus();
      if (status.authenticated) {
        setAuthenticated(true);
        setStep("done");
      } else {
        setStep("phone");
      }
    } catch {
      setStep("phone");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode() {
    try {
      setLoading(true);
      setError("");
      await sendCode(phone);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    try {
      setLoading(true);
      setError("");
      const result = await verifyCode(code);
      if (result.passwordRequired) {
        setStep("password");
      } else if (result.authenticated) {
        setAuthenticated(true);
        setStep("done");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyPassword() {
    try {
      setLoading(true);
      setError("");
      const result = await verifyPassword(password);
      if (result.authenticated) {
        setAuthenticated(true);
        setStep("done");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to verify password"
      );
    } finally {
      setLoading(false);
    }
  }

  if (step === "check") {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking authentication status...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md">
      <div className="flex items-center gap-3">
        <StatusBadge connected={authenticated} />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "done" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Authenticated
            </CardTitle>
            <CardDescription>
              Your Telegram session is active. You can now use the dashboard to
              collect and summarize messages.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {step === "phone" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Step 1: Phone Number
            </CardTitle>
            <CardDescription>
              Enter your phone number with country code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
              />
            </div>
            <Button onClick={handleSendCode} disabled={loading || !phone}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send Code
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "code" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Step 2: Verification Code
            </CardTitle>
            <CardDescription>
              Enter the code sent to your Telegram app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="12345"
              />
            </div>
            <Button onClick={handleVerifyCode} disabled={loading || !code}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify Code
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "password" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Step 3: Two-Factor Password
            </CardTitle>
            <CardDescription>
              Your account has 2FA enabled. Enter your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your 2FA password"
              />
            </div>
            <Button
              onClick={handleVerifyPassword}
              disabled={loading || !password}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify Password
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
