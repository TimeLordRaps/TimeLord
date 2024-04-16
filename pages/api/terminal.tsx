// pages/api/terminal.tsx
import { NextApiHandler } from 'next';
import { execSync } from 'child_process';

const TMUX_SESSION_NAME = 'timelord';
const DOCKER_CONTAINER_NAME = 'terminal';

interface TerminalCommand {
  command: string;
  stdout: string;
  stderr: string;
  success: boolean;
}

class TerminalMemory {
  sessionOutput: string[];

  constructor() {
    this.sessionOutput = [];
  }

  updateSession(output: string) {
    this.sessionOutput = output.split('\n').filter(line => line.trim());
  }

  getLastCommandOutput(command: string): string {
    // find the line that contains the command
    const commandIndex = this.sessionOutput.findLastIndex(line => line.includes(command));
    if (commandIndex !== -1 && commandIndex + 1 < this.sessionOutput.length) {
      // slice all the lines after the commandIndex except the last line that holds the terminal input prompt
      return this.sessionOutput.slice(commandIndex + 1, -1).join('\n');
    }
    return '';
  }
}

const terminalMemory = new TerminalMemory();

const handler: NextApiHandler = (req, res) => {
  if (req.method === 'POST') {
    const { command } = req.body;
    try {
      ensureDockerService();
      executeCommandInTmux(command, res);
    } catch (error) {
      res.status(500).json({ message: `Error processing command: ${error.message}` });
    }
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
  const escapedCommand = command.replace(/'/g, "'\\''");
  const tmuxSendKeys = `tmux send-keys -t ${TMUX_SESSION_NAME} '${escapedCommand}' Enter`;
  const tmuxCapturePane = `tmux capture-pane -p -t ${TMUX_SESSION_NAME}`;
  const dockerCommand = `docker-compose exec -T ${DOCKER_CONTAINER_NAME} bash -c "${tmuxSendKeys}; sleep 1; ${tmuxCapturePane}"`;

  try {
    const fullOutput = execSync(dockerCommand).toString();
    terminalMemory.updateSession(fullOutput);
    const formattedOutput = terminalMemory.getLastCommandOutput(command);

    res.write(`${formattedOutput}\n`);
    res.end();
  } catch (error) {
    console.error('Error executing command:', error);
    const errorMessage = `Error executing command: ${error.message}`;
    res.write(`${errorMessage}\n`);
    res.end();
  }
}

export default handler;