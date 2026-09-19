const { WebSocketServer } = require('ws');
const url = require('url');

let wss = null;

function initWebSocket(server) {
  wss = new WebSocketServer({ server });
  console.log('[WebSocket] Server initialized');

  wss.on('connection', (ws, req) => {
    const parameters = url.parse(req.url, true).query;
    const advertiserId = parseInt(parameters.advertiserId, 10);
    
    if (!isNaN(advertiserId)) {
      ws.advertiserId = advertiserId;
      console.log(`[WebSocket] Client connected and subscribed to advertiser: ${advertiserId}`);
    } else {
      console.log('[WebSocket] Client connected without advertiser ID');
    }

    ws.on('message', (messageStr) => {
      try {
        const msg = JSON.parse(messageStr);
        if (msg.type === 'subscribe' && msg.advertiserId) {
          ws.advertiserId = parseInt(msg.advertiserId, 10);
          console.log(`[WebSocket] Client subscribed to advertiser: ${ws.advertiserId}`);
        }
      } catch (err) {
        console.error('[WebSocket] Message parsing error:', err.message);
      }
    });

    ws.on('close', () => {
      console.log(`[WebSocket] Client disconnected from advertiser: ${ws.advertiserId}`);
    });
  });
}

function broadcastToAdvertiser(advertiserId, event) {
  if (!wss) return;
  const payload = JSON.stringify(event);
  const targetId = parseInt(advertiserId, 10);
  
  let count = 0;
  wss.clients.forEach(client => {
    if (client.readyState === 1 && client.advertiserId === targetId) {
      client.send(payload);
      count++;
    }
  });
  console.log(`[WebSocket] Broadcasted event ${event.type} to ${count} client(s) for advertiser ${targetId}`);
}

module.exports = {
  initWebSocket,
  broadcastToAdvertiser
};
