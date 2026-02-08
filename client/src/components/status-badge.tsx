import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  connected: boolean;
  label?: string;
}

export function StatusBadge({ connected, label }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        connected
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          connected ? "bg-green-500" : "bg-red-500"
        )}
      />
      {label || (connected ? "Connected" : "Not connected")}
    </span>
  );
}
