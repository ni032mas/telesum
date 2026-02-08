import { useState, useEffect, useCallback, useRef } from "react";

interface SseOptions {
  url: string;
  enabled?: boolean;
}

export function useSse<T>(options: SseOptions) {
  const { url, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;
    if (sourceRef.current) {
      sourceRef.current.close();
    }

    const source = new EventSource(url);
    sourceRef.current = source;

    source.onopen = () => setConnected(true);

    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as T;
        setData(parsed);
        setError(null);
      } catch {
        setError("Failed to parse SSE data");
      }
    };

    source.onerror = () => {
      setConnected(false);
      source.close();
      sourceRef.current = null;
    };
  }, [url, enabled]);

  const disconnect = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { data, error, connected, reconnect: connect, disconnect };
}
