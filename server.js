// server.js
const { execSync, exec } = require('child_process');
const next = require('next');
const { createServer } = require('http');
const { parse } = require('url');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const startDockerTerminal = () => {
  try {
    // Check if Docker is available
    execSync('docker ps', { stdio: 'ignore' });
    console.log('Docker is available, starting terminal service...');
    
    // Start the Docker terminal service
    exec('docker-compose up -d terminal', { stdio: 'inherit' }, (error, stdout, stderr) => {
      if (error) {
        console.error('Error starting terminal service:', error);
        return;
      }
      console.log('Terminal service started successfully:', stdout);
    });
  } catch (error) {
    console.log('Docker is not available, skipping terminal service startup.');
  }
};

app.prepare().then(() => {
  startDockerTerminal();
  
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.listen(process.env.PORT || 3000, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
  });

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
      try {
        execSync('docker-compose stop terminal');
        console.log('Docker containers stopped.');
      } catch (error) {
        console.error('Failed to stop Docker containers:', error);
      }
      console.log('Server has been shut down.');
      process.exit();
    });
  });
});