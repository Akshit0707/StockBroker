import { WebSocketServer, WebSocket, type RawData } from 'ws';
import type { Server as HttpServer } from 'http';
import { redisSub } from '../redis';

const clients = new Set<WebSocket>();

const safeJsonParse = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const initializeWebSocket = (server: HttpServer): void => {
  const wss = new WebSocketServer({ server, path: '/ws' });

  const broadcastToAll = (data: unknown) => {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  redisSub.on('message', (channel: string, message: string) => {
    const payload = safeJsonParse(message);
    const type = channel.toLowerCase();

    broadcastToAll({
      type,
      message: payload,
    });
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    clients.add(ws);

    ws.send(
      JSON.stringify({
        type: 'connected',
        message: 'Connected to the WebSocket server!',
      }),
    );

    ws.on('message', (data: RawData) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received message:', message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });
};