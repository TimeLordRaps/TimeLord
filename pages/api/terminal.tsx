import { NextApiHandler } from 'next';
import { execSync, spawn } from 'child_process';

const TMUX_SESSION_NAME = 'timelord';
const DOCKER_CONTAINER_NAME = 'terminal';

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
    const result = execSync(`docker-compose exec ${DOCKER_CONTAINER_NAME} tmux has-session -t ${TMUX_SESSION_NAME} 2>&1 || true`).toString().trim();
    if (result.includes('no server running on')) {
      console.warn('tmux session does not exist, creating a new one');
      execSync(`docker-compose exec ${DOCKER_CONTAINER_NAME} tmux new-session -d -s ${TMUX_SESSION_NAME}`);
    }
  } catch (error) {
    console.error('Failed to ensure tmux session exists:', error);
    throw new Error(`Failed to ensure tmux session exists: ${error.message}`);
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
  console.log('Received command:', command);

  const escapedCommand = command.replace(/'/g, "'\\''");
  const tmuxSendKeys = `tmux send-keys -t ${TMUX_SESSION_NAME} '${escapedCommand}' Enter`;
  const tmuxCapturePane = `tmux capture-pane -p -J -t ${TMUX_SESSION_NAME}`;
  const dockerCommand = `docker-compose exec -T ${DOCKER_CONTAINER_NAME} bash -c "${tmuxSendKeys} && sleep 1 && ${tmuxCapturePane}"`;

  const child = spawn('docker-compose', ['exec', '-T', DOCKER_CONTAINER_NAME, 'bash', '-c', `${tmuxSendKeys} && sleep 1 && ${tmuxCapturePane}`]);

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (data) => {
    console.log('stdout:', data);
    res.write(`data: ${data}\n\n`);
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (data) => {
    console.error('stderr:', data);
    res.write(`data: ${data}\n\n`);
  });

  child.on('close', (code) => {
    console.log('Closing code:', code);
    res.write(`data: Command exited with code ${code}\n\n`);
    res.end();
  });
}

export default handler;