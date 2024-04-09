// pages/api/terminal.tsx
import { exec } from 'docker-compose';
import { Server } from 'socket.io';
import { exec as execCallback } from 'child_process';

export default function handler(req, res) {
  if (res.socket.server.io) {
    console.log('Socket.IO already setup');
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log('Client connected');

    // Check if Docker is running
    execCallback('docker info', (error, stdout, stderr) => {
      if (error) {
        console.error('Docker is not running:', error);
        socket.emit('output', 'Error: Docker is not running. Please start Docker and try again.');
        socket.disconnect();
      } else {
        console.log('Docker is running');

        socket.on('command', async (command) => {
          console.log('Received command:', command);

          try {
            const output = await exec('terminal', ['sh', '-c', command], { stdout: true, stderr: true });
            console.log('Command output:', output);
            socket.emit('output', output);
          } catch (error) {
            console.error('Error executing command:', error);
            socket.emit('output', error.message);
          }
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  console.log('Socket.IO setup complete');
  res.end();
}