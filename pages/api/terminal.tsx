// pages/api/terminal.tsx
import { exec } from 'child_process';
import { Server as SocketIOServer } from 'socket.io';

export default function handler(req, res) {
  if (res.socket.server.io) {
    console.log('Socket.io is already running.');
    res.end();
    return;
  }

  const io = new SocketIOServer(res.socket.server);
  res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log('A client has connected.');

    socket.on('command', (command) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Exec error: ${error}`);
          socket.emit('output', `Exec error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
          socket.emit('output', `Stderr: ${stderr}`);
          return;
        }
        console.log(`Stdout: ${stdout}`);
        socket.emit('output', stdout);
      });
    });

    socket.on('disconnect', () => {
      console.log('A client has disconnected.');
    });
  });

  console.log('Socket.io has been initialized.');
  res.end();
}
