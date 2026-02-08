import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/app-shell";
import { SettingsPage } from "@/pages/settings-page";
import { AuthPage } from "@/pages/auth-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { SummariesPage } from "@/pages/summaries-page";
import { SummaryDetailPage } from "@/pages/summary-detail-page";

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/summaries" element={<SummariesPage />} />
        <Route path="/summaries/:id" element={<SummaryDetailPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
