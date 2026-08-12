/**
 * ws.ts — useLiveUpdates() hook for WebSocket-based real-time events.
 *
 * Features:
 * - Opens WebSocket on mount.
 * - Auto-reconnects with exponential backoff (capped at 30s) on close.
 * - Cleans up on component unmount.
 * - Exposes the latest parsed event via the `onEvent` callback (no stale closure issues).
 */

"use client";

import { useEffect, useRef, useCallback } from "react";

export interface LiveEvent {
  event: "new_grievance" | "grievance_resolved" | "project_vote";
  data: Record<string, unknown>;
}

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/live-updates";

const BASE_RECONNECT_MS = 1_000;
const MAX_RECONNECT_MS = 30_000;

export function useLiveUpdates(onEvent: (event: LiveEvent) => void): void {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelayRef = useRef<number>(BASE_RECONNECT_MS);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef<boolean>(false);
  // Keep a stable ref to the callback to avoid re-running the effect on every render
  const onEventRef = useRef<(event: LiveEvent) => void>(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (unmountedRef.current) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      if (process.env.NODE_ENV === "development") {
        console.log("[WS] Connected to live-updates feed.");
      }
      reconnectDelayRef.current = BASE_RECONNECT_MS; // Reset backoff on successful connect
    };

    ws.onmessage = (ev: MessageEvent) => {
      try {
        const parsed: LiveEvent = JSON.parse(ev.data as string);
        onEventRef.current(parsed);
      } catch {
        // Ignore malformed frames (e.g. keep-alive pings)
      }
    };

    ws.onclose = () => {
      if (unmountedRef.current) return;
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[WS] Disconnected. Reconnecting in ${reconnectDelayRef.current}ms…`
        );
      }
      reconnectTimerRef.current = setTimeout(() => {
        reconnectDelayRef.current = Math.min(
          reconnectDelayRef.current * 2,
          MAX_RECONNECT_MS
        );
        connect();
      }, reconnectDelayRef.current);
    };

    ws.onerror = () => {
      // onclose fires after onerror — reconnect logic is handled there.
      ws.close();
    };
  }, []); // Empty deps: connect is a stable function

  useEffect(() => {
    unmountedRef.current = false;
    connect();

    return () => {
      unmountedRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);
}
