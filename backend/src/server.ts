/**
 * Fastify server with WebSocket support for streaming metric data
 */

import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { createNodes, generateMetricFrame } from "./simulator.js";
import type { ProviderNode, MetricFrame } from "./types.js";

const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || "0.0.0.0";

// Create Fastify instance
const fastify = Fastify({
  logger: true,
});

// Initialize nodes (20-30 nodes)
const nodes: ProviderNode[] = createNodes();

// Store active WebSocket connections
const connections = new Set<{ socket: { send: (data: string) => void } }>();

// Store recent frames in a ring buffer (for history queries)
const MAX_HISTORY_FRAMES = 1800; // ~15-30 minutes at 1 frame per second
const historyBuffer: MetricFrame[] = [];

/**
 * Add a frame to the history buffer (ring buffer implementation)
 */
function addToHistory(frame: MetricFrame): void {
  historyBuffer.push(frame);
  if (historyBuffer.length > MAX_HISTORY_FRAMES) {
    historyBuffer.shift(); // Remove oldest frame
  }
}

/**
 * Start the metric generator that emits frames every 500-1000ms
 */
function startMetricGenerator(): void {
  const interval = 500 + Math.random() * 500; // 500-1000ms

  setInterval(() => {
    const frame = generateMetricFrame(nodes);
    addToHistory(frame);

    // Log a sample frame for validation (every 10th frame)
    if (Math.random() < 0.1) {
      console.log("Sample frame:", JSON.stringify(frame, null, 2));
    }

    // Broadcast to all connected clients
    const frameJson = JSON.stringify(frame);
    connections.forEach((conn) => {
      try {
        conn.socket.send(frameJson);
      } catch (error) {
        console.error("Error sending frame to client:", error);
      }
    });
  }, interval);
}

// Start the server
async function start() {
  try {
    // Register WebSocket plugin first
    await fastify.register(websocket);

    // REST endpoint: GET /api/nodes
    fastify.get("/api/nodes", async (request, reply) => {
      return nodes;
    });

    // REST endpoint: GET /api/history?from=ts&to=ts
    fastify.get<{
      Querystring: { from?: string; to?: string };
    }>("/api/history", async (request, reply) => {
      const from = request.query.from ? Number(request.query.from) : undefined;
      const to = request.query.to ? Number(request.query.to) : undefined;

      let filtered = historyBuffer;

      if (from !== undefined) {
        filtered = filtered.filter((frame) => frame.ts >= from);
      }

      if (to !== undefined) {
        filtered = filtered.filter((frame) => frame.ts <= to);
      }

      return filtered;
    });

    // REST endpoint: GET /api/insights?since=ts
    fastify.get<{
      Querystring: { since?: string };
    }>("/api/insights", async (request, reply) => {
      const since = request.query.since ? Number(request.query.since) : Date.now() - 60000; // Default: last minute

      // TODO: Implement insights engine based on historical data
      return [];
    });

    // WebSocket endpoint: /ws
    fastify.get("/ws", { websocket: true }, (connection, req) => {
      console.log("WebSocket client connected");

      const conn = {
        socket: {
          send: (data: string) => {
            connection.socket.send(data);
          },
        },
      };

      connections.add(conn);

      // Send initial nodes data
      connection.socket.send(JSON.stringify({ type: "nodes", data: nodes }));

      connection.socket.on("close", () => {
        console.log("WebSocket client disconnected");
        connections.delete(conn);
      });

      connection.socket.on("error", (error: Error) => {
        console.error("WebSocket error:", error);
        connections.delete(conn);
      });
    });

    // Root endpoint
    fastify.get("/", async (request, reply) => {
      return {
        name: "Data Operations Visualizer API",
        version: "1.0.0",
        endpoints: {
          websocket: "/ws",
          nodes: "/api/nodes",
          history: "/api/history?from=ts&to=ts",
          insights: "/api/insights?since=ts",
          health: "/health",
        },
      };
    });

    // Health check endpoint
    fastify.get("/health", async (request, reply) => {
      return { status: "ok", timestamp: Date.now() };
    });

    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Server listening on http://${HOST}:${PORT}`);
    console.log(`WebSocket endpoint: ws://${HOST}:${PORT}/ws`);
    console.log(`Nodes initialized: ${nodes.length}`);

    // Start the metric generator
    startMetricGenerator();
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();

