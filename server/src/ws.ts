import type { Server as HttpServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { getAllLiveReadings } from "./lib/sensorSim.js";
import type { PayoutEvent, SensorReading } from "./types.js";

let wss: WebSocketServer | null = null;

export function attachWebSocketServer(server: HttpServer) {
  wss = new WebSocketServer({ server, path: "/ws/sensors" });

  wss.on("connection", (socket) => {
    socket.send(JSON.stringify({ type: "snapshot", readings: getAllLiveReadings() }));
  });
}

function broadcast(payload: unknown) {
  if (!wss) return;
  const message = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(message);
  }
}

export function broadcastSensorTick(readings: SensorReading[]) {
  broadcast({ type: "tick", readings });
}

export function broadcastPayoutEvent(event: PayoutEvent) {
  broadcast({ type: "payout", event });
}
