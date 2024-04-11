import { NextApiHandler } from 'next';
import { execSync, spawn } from 'child_process';

const TMUX_SESSION_NAME = 'timelord';
const DOCKER_CONTAINER_NAME = process.env.DOCKER_TERMINAL_CONTAINER_NAME || 'timelord-terminal';

const handler: NextApiHandler = (req, res) => {
  if (req.method === 'POST') {
    const { command } = req.body;
    try {
      ensureDockerAndTmux();
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
  const commandToSend = `tmux send-keys -t ${TMUX_SESSION_NAME} '${command}' C-m`;
  const child = spawn('docker', ['exec', DOCKER_CONTAINER_NAME, 'sh', '-c', commandToSend]);

  child.stdout.on('data', (data) => {
    res.write(`data: ${data.toString()}\n\n`);
  });

  child.stderr.on('data', (data) => {
    res.write(`data: ${data.toString()}\n\n`);
  });

  child.on('close', (code) => {
    res.write(`data: Command exited with code ${code}\n\n`);
    res.end();
  });
}

function ensureDockerAndTmux() {
  if (!dockerIsRunning()) {
    startDockerContainer();
  }
  ensureTmuxSessionExists();
}

function dockerIsRunning() {
  try {
    const output = execSync(`docker inspect --format='{{.State.Running}}' ${DOCKER_CONTAINER_NAME}`).toString().trim();
    return output === 'true';
  } catch (error) {
    return false;
  }
}

function startDockerContainer() {
  try {
    execSync(`docker run --name ${DOCKER_CONTAINER_NAME} -d ubuntu:latest`);
  } catch (error) {
    throw new Error(`Failed to start Docker container: ${error.message}`);
  }
}

function ensureTmuxSessionExists() {
  try {
    execSync(`docker exec ${DOCKER_CONTAINER_NAME} tmux has-session -t ${TMUX_SESSION_NAME}`);
  } catch (e) {
    execSync(`docker exec ${DOCKER_CONTAINER_NAME} tmux new-session -d -s ${TMUX_SESSION_NAME}`);
  }
}

export default handler;
