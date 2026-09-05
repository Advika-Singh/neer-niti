import { useEffect, useRef, useState } from "react";
import { WS_URL } from "./api";
import type { PayoutEvent, SensorReading } from "./types";

interface SocketMessage {
  type: "snapshot" | "tick" | "payout";
  readings?: SensorReading[];
  event?: PayoutEvent;
}

/**
 * Live sensor telemetry pushed from the backend over WebSocket, plus a running feed of
 * parametric payout-trigger events as they fire in real time.
 */
export function useLiveSensors() {
  const [readings, setReadings] = useState<Record<string, SensorReading>>({});
  const [payoutEvents, setPayoutEvents] = useState<PayoutEvent[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout>;

    function connect() {
      const socket = new WebSocket(`${WS_URL}/ws/sensors`);
      socketRef.current = socket;

      socket.onmessage = (event) => {
        if (cancelled) return;
        try {
          const msg = JSON.parse(event.data as string) as SocketMessage;
          if ((msg.type === "snapshot" || msg.type === "tick") && msg.readings) {
            setReadings((prev) => {
              const next = { ...prev };
              for (const r of msg.readings!) next[r.districtId] = r;
              return next;
            });
          } else if (msg.type === "payout" && msg.event) {
            setPayoutEvents((prev) => [msg.event!, ...prev].slice(0, 20));
          }
        } catch {
          // ignore malformed message
        }
      };

      socket.onclose = () => {
        if (!cancelled) retryTimer = setTimeout(connect, 3000);
      };
    }

    connect();
    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      socketRef.current?.close();
    };
  }, []);

  return { readings, payoutEvents };
}
