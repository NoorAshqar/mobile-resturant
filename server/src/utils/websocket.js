const { WebSocketServer, WebSocket } = require("ws");

let wss = null;

function initWebSocketServer(server) {
  wss = new WebSocketServer({ server, path: "/ws/orders" });

  // Heartbeat to clean up dead connections
  const heartbeat = setInterval(() => {
    if (!wss) return;
    wss.clients.forEach((client) => {
      if (client.isAlive === false) {
        client.terminate();
        return;
      }
      client.isAlive = false;
      client.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(heartbeat));

  wss.on("connection", (ws) => {
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.send(JSON.stringify({ type: "connected" }));
  });

  console.log("[WS] WebSocket server ready on /ws/orders");
}

function broadcastOrderUpdate(order) {
  if (!wss || !order) {
    console.warn(
      "[WS_BROADCAST_ERROR] WebSocket server not ready or order is null",
      {
        wssExists: !!wss,
        orderExists: !!order,
      },
    );
    return;
  }

  const message = JSON.stringify({
    type: "order:update",
    payload: order,
  });

  wss.clients.forEach((client) => {
    clientCount++;
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      successCount++;
    }
  });
}

module.exports = {
  initWebSocketServer,
  broadcastOrderUpdate,
};
