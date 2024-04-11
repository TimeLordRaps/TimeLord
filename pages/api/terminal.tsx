import { NextApiHandler } from 'next';
import { execSync, spawn } from 'child_process';

const TMUX_SESSION_NAME = 'timelord';
const DOCKER_CONTAINER_NAME = 'terminal';  // Update to match your Docker Compose service name

const handler: NextApiHandler = (req, res) => {
  if (req.method === 'POST') {
    const { command } = req.body;
    try {
      ensureDockerService();
      executeCommandInTmux(command, res);
    } catch (error) {
      res.status(500).json({ message: `Error processing command: ${error.message}` });
    }
  } else if (req.method === 'GET') {
    setupSSE(res);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

function ensureDockerService() {
  try {
    // Checks if the service is running; if not, starts or restarts the service
    const status = execSync(`docker-compose ps ${DOCKER_CONTAINER_NAME}`).toString();
    if (!status.includes('Up')) {
      execSync(`docker-compose up -d ${DOCKER_CONTAINER_NAME}`);
    }
    ensureTmuxSessionExists();
  } catch (error) {
    throw new Error(`Failed to manage Docker container: ${error.message}`);
  }
}

function ensureTmuxSessionExists() {
  try {
    // Checks if a tmux session exists, if not, creates it
    execSync(`docker-compose exec ${DOCKER_CONTAINER_NAME} tmux has-session -t ${TMUX_SESSION_NAME}`);
  } catch (error) {
    execSync(`docker-compose exec ${DOCKER_CONTAINER_NAME} tmux new-session -d -s ${TMUX_SESSION_NAME}`);
  }
}

function setupSSE(res: NextApiResponse) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const interval = setInterval(() => {
    res.write('data: ping\n\n');
  }, 30000);

  res.on('close', () => {
    clearInterval(interval);
    res.end();
  });
}

function executeCommandInTmux(command: string, res: NextApiResponse) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const escapedCommand = command.replace(/'/g, "'\\''");
  const tmuxSendKeys = `tmux send-keys -t ${TMUX_SESSION_NAME} '${escapedCommand}' Enter`;
  const tmuxCapturePane = `tmux capture-pane -p -J -t ${TMUX_SESSION_NAME}`;
  const dockerCommand = `docker-compose exec -T ${DOCKER_CONTAINER_NAME} bash -c "${tmuxSendKeys}; ${tmuxCapturePane}"`;

  const process = spawn('bash', ['-c', dockerCommand]);

  process.stdout.on('data', (data) => {
    res.write(`data: ${data.toString()}\n\n`);
  });

  process.stderr.on('data', (data) => {
    res.write(`data: ${data.toString()}\n\n`);
  });

  process.on('close', (code) => {
    res.write(`data: Command exited with code ${code}\n\n`);
    res.end();
  });
}

export default handler;
