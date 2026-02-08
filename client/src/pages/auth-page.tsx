import { AuthWizard } from "@/components/auth-wizard";

export function AuthPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Telegram Auth</h2>
      <AuthWizard />
    </div>
  );
}
