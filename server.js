const { exec } = require('child_process');
const next = require('next');
const { createServer } = require('http');
const { parse } = require('url');
const { promisify } = require('util');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const execAsync = promisify(exec);

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });

  const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');

    // Stop the server from accepting new connections
    server.close(async () => {
      console.log('HTTP server closed.');

      // Ensure all Docker Compose services are stopped
      try {
        console.log('Stopping Docker containers via Docker Compose...');
        await execAsync('docker-compose down');
        console.log('Docker containers stopped successfully.');
      } catch (error) {
        console.error('Error stopping Docker containers:', error);
      }

      process.exit(0); // Exit the process after cleanup
    });
  };

  // Handle SIGINT (Ctrl+C) and SIGTERM (Heroku dyno shutdown)
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
});
