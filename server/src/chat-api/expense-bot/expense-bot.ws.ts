import WebSocket, { WebSocketServer } from "ws";

let wss: WebSocketServer | null = null;

/**
 * Initializes the WebSocket server.
 * Call this only after the database connection is established.
 */
export function startWebSocketServer() {
  if (!wss) {
    wss = new WebSocketServer({ port: 8080 });

    wss.on("connection", (ws) => {
      ws.on("message", (message) => {
        ws.send(message);
      });
      ws.send("WebSocket server connected. Send a message!");
    });

    console.log("WebSocket chat server running on ws://localhost:8080");
  }
}

export default wss;
