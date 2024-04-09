// server.js
const { execSync } = require('child_process');
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
    execSync('docker-compose up -d terminal', { stdio: 'inherit' });
  } catch (error) {
    console.log('Docker is not available, skipping terminal service startup.');
  }
};

app.prepare().then(() => {
  startDockerTerminal();

  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
  });
});
