// pages/api/terminal.tsx
import { NextApiHandler } from 'next';
import { Server } from 'http';
import { WebSocketServer } from 'ws';
import { exec } from 'child_process';

const handler: NextApiHandler = (req, res) => {
  if (!res.socket.server.io) {
    const server = res.socket.server as unknown as Server;
    const wss = new WebSocketServer({ server, path: '/api/terminal' });

    wss.on('connection', (ws) => {
      console.log('Client connected');

      ws.on('message', (message) => {
        const command = message.toString();
        exec(`docker exec -i terminal sh -c "${command}"`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Exec error: ${error}`);
            ws.send(`Exec error: ${error.message}`);
            return;
          }
          if (stderr) {
            console.error(`Stderr: ${stderr}`);
            ws.send(`Stderr: ${stderr}`);
            return;
          }
          console.log(`Stdout: ${stdout}`);
          ws.send(stdout);
        });
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });

    res.socket.server.io = wss;
  }

  res.end();
};

export default handler;